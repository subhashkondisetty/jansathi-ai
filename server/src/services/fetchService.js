/**
 * @fileoverview Safe HTTP fetch service for official government sources.
 * Enforces strict SSRF mitigations, DNS resolution IP filtering, redirect constraints,
 * and content-type validation.
 */

import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns';
import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../utils/logger.js';

/**
 * Checks whether an IP address belongs to loopback, private, link-local, or cloud metadata ranges.
 *
 * @param {string} ip - IP address string.
 * @returns {boolean} True if IP address is disallowed.
 */
export const isDisallowedIp = (ip) => {
  if (!ip || typeof ip !== 'string') return true;
  const normalized = ip.trim().toLowerCase();

  // IPv4-mapped IPv6 check (::ffff:192.168.1.1)
  if (normalized.startsWith('::ffff:')) {
    return isDisallowedIp(normalized.slice(7));
  }

  // IPv6 loopback and private/link-local ranges
  if (normalized === '::1' || normalized === '::') return true;
  if (
    normalized.startsWith('fe80:') ||
    normalized.startsWith('fc00:') ||
    normalized.startsWith('fd')
  ) {
    return true;
  }

  // IPv4 ranges
  const parts = normalized.split('.').map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = parts;
    if (a === 0) return true; // Current network
    if (a === 127) return true; // Loopback (127.0.0.0/8)
    if (a === 10) return true; // Class A private (10.0.0.0/8)
    if (a === 172 && b >= 16 && b <= 31) return true; // Class B private (172.16.0.0/12)
    if (a === 192 && b === 168) return true; // Class C private (192.168.0.0/16)
    if (a === 169 && b === 254) return true; // Link-local / Cloud metadata (169.254.0.0/16)
    if (a === 100 && b >= 64 && b <= 127) return true; // Carrier-grade NAT (100.64.0.0/10)
    if (a >= 224) return true; // Multicast and reserved
  }

  return false;
};

/**
 * Checks whether a hostname matches localhost or loopback strings.
 *
 * @param {string} hostname - Hostname to inspect.
 * @returns {boolean} True if hostname is disallowed.
 */
export const isDisallowedHostname = (hostname) => {
  const lower = (hostname || '').toLowerCase();
  return lower === 'localhost' || lower === '127.0.0.1' || lower === '::1';
};

/**
 * Creates a custom DNS lookup function that checks all resolved IPs against an IP guard.
 *
 * @param {Function} [ipGuard] - Custom IP guard function (defaults to isDisallowedIp).
 * @returns {Function} DNS lookup function suitable for http/https Agent.
 */
export const createSafeLookup = (ipGuard = isDisallowedIp) => {
  return (hostname, options, callback) => {
    const cb = typeof options === 'function' ? options : callback;
    const opts = typeof options === 'object' ? options : {};

    if (ipGuard === isDisallowedIp && isDisallowedHostname(hostname)) {
      const err = new ApiError(400, 'SSRF_BLOCKED', 'SSRF blocked: hostname is disallowed');
      err.code = 'SSRF_BLOCKED';
      return cb(err);
    }

    dns.lookup(hostname, { all: true }, (err, addresses) => {
      if (err) return cb(err);
      if (!addresses || addresses.length === 0) {
        const notFoundErr = new ApiError(
          404,
          'DNS_NOT_FOUND',
          `Hostname ${hostname} could not be resolved`
        );
        notFoundErr.code = 'ENOTFOUND';
        return cb(notFoundErr);
      }

      for (const entry of addresses) {
        if (ipGuard(entry.address)) {
          const ssrfErr = new ApiError(
            400,
            'SSRF_BLOCKED',
            `SSRF blocked: IP ${entry.address} is in a disallowed address range`
          );
          ssrfErr.code = 'SSRF_BLOCKED';
          return cb(ssrfErr);
        }
      }

      if (opts.all) {
        return cb(null, addresses);
      }
      return cb(null, addresses[0].address, addresses[0].family);
    });
  };
};

/**
 * Fetches content from an approved government Source URL with bounded retries,
 * SSRF verification, manual redirect handling, and size capping.
 *
 * @param {Object} source - Source document from database.
 * @param {Object} [options] - Optional override parameters.
 * @param {Function} [options.ipGuard] - Injectable IP validation function for testing.
 * @returns {Promise<{buffer: Buffer, contentType: string, httpLastModified?: string, finalUrl: string}>}
 */
export const fetchSource = async (source, options = {}) => {
  if (!source || !source.url) {
    throw new ApiError(400, 'INVALID_SOURCE', 'Valid Source object with URL is required');
  }

  const initialUrl = source.url;
  const initialParsed = new URL(initialUrl);
  const sourceHostname = initialParsed.hostname.toLowerCase();

  const ipGuard = options.ipGuard || isDisallowedIp;
  const safeLookup = createSafeLookup(ipGuard);

  const httpAgent = new http.Agent({ lookup: safeLookup, keepAlive: false });
  const httpsAgent = new https.Agent({ lookup: safeLookup, keepAlive: false });

  let currentUrl = initialUrl;
  let hops = 0;
  const maxHops = 3;
  const maxBytes = (env.MAX_FETCH_MB || 25) * 1024 * 1024;

  while (hops <= maxHops) {
    const currentParsed = new URL(currentUrl);

    if (currentParsed.protocol !== 'http:' && currentParsed.protocol !== 'https:') {
      throw new ApiError(400, 'INVALID_PROTOCOL', 'Source protocol must be http: or https:');
    }

    if (currentParsed.username || currentParsed.password) {
      throw new ApiError(400, 'SSRF_BLOCKED', 'Embedded credentials in URL are disallowed');
    }

    // Hostname pinning: redirects cannot leave the source domain
    if (currentParsed.hostname.toLowerCase() !== sourceHostname) {
      throw new ApiError(
        400,
        'SSRF_BLOCKED',
        `Redirect to foreign host "${currentParsed.hostname}" is disallowed`
      );
    }

    let response;
    try {
      response = await axios({
        method: 'get',
        url: currentUrl,
        headers: {
          'User-Agent': env.FETCH_USER_AGENT || 'JanSathiBot/1.0',
          Accept:
            source.sourceType === 'pdf'
              ? 'application/pdf,*/*;q=0.8'
              : 'text/html,application/xhtml+xml,*/*;q=0.8',
        },
        timeout: env.FETCH_TIMEOUT_MS || 20000,
        maxRedirects: 0,
        validateStatus: (status) =>
          (status >= 200 && status < 400) || [301, 302, 303, 307, 308].includes(status),
        responseType: 'stream',
        httpAgent,
        httpsAgent,
      });
    } catch (err) {
      if (err.code === 'SSRF_BLOCKED' || (err.cause && err.cause.code === 'SSRF_BLOCKED')) {
        throw new ApiError(400, 'SSRF_BLOCKED', 'Request blocked by SSRF protection');
      }
      if (err.response) {
        const status = err.response.status;
        if (status === 404 || status === 410) {
          throw new ApiError(status, 'SOURCE_NOT_FOUND', `Source returned HTTP ${status}`);
        }
        if (status === 401 || status === 403) {
          throw new ApiError(status, 'SOURCE_FORBIDDEN', `Source returned HTTP ${status}`);
        }
        throw new ApiError(status, 'SOURCE_HTTP_ERROR', `Source returned HTTP ${status}`);
      }
      throw err;
    }

    // Handle manual redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      hops++;
      if (hops > maxHops) {
        throw new ApiError(400, 'MAX_REDIRECTS_EXCEEDED', 'Exceeded maximum limit of 3 redirects');
      }
      const location = response.headers.location;
      if (!location) {
        throw new ApiError(400, 'INVALID_REDIRECT', 'Redirect response missing Location header');
      }
      currentUrl = new URL(location, currentUrl).href;
      logger.info({ hops, redirectUrl: currentUrl }, 'Following safe source redirect');
      continue;
    }

    // Read content stream with size ceiling
    const stream = response.data;
    const chunks = [];
    let totalBytes = 0;

    const buffer = await new Promise((resolve, reject) => {
      stream.on('data', (chunk) => {
        totalBytes += chunk.length;
        if (totalBytes > maxBytes) {
          stream.destroy();
          reject(
            new ApiError(
              413,
              'PAYLOAD_TOO_LARGE',
              `Source content exceeds maximum allowed size of ${env.MAX_FETCH_MB}MB`
            )
          );
        } else {
          chunks.push(chunk);
        }
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });

    const contentType = (response.headers['content-type'] || '').toLowerCase();
    const httpLastModified = response.headers['last-modified'] || undefined;

    // Content-Type validation
    if (source.sourceType === 'pdf') {
      const isPdfHeader =
        buffer.length >= 4 && buffer.slice(0, 5).toString('ascii').startsWith('%PDF-');
      const isPdfMime =
        contentType.includes('application/pdf') || contentType.includes('application/octet-stream');
      if (!isPdfHeader && !isPdfMime) {
        throw new ApiError(
          415,
          'UNSUPPORTED_CONTENT',
          `Expected PDF content but received Content-Type: ${contentType}`
        );
      }
    } else if (source.sourceType === 'html') {
      const isHtmlMime =
        contentType.includes('text/html') ||
        contentType.includes('application/xhtml+xml') ||
        contentType.includes('text/plain');
      if (!isHtmlMime && !buffer.toString('utf-8', 0, 100).includes('<')) {
        throw new ApiError(
          415,
          'UNSUPPORTED_CONTENT',
          `Expected HTML content but received Content-Type: ${contentType}`
        );
      }
    }

    return {
      buffer,
      contentType,
      httpLastModified,
      finalUrl: currentUrl,
    };
  }

  throw new ApiError(400, 'MAX_REDIRECTS_EXCEEDED', 'Exceeded maximum allowed redirect hops');
};

export default {
  isDisallowedIp,
  isDisallowedHostname,
  createSafeLookup,
  fetchSource,
};
