import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Helmet with strict CSP for JSON API
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      baseUri: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

// Parse comma-separated CLIENT_ORIGIN
const allowedOrigins = env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow server-to-server, CLI (curl), or mobile requests with no browser Origin header
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(
      new ApiError(403, 'FORBIDDEN', `CORS request from origin '${origin}' blocked by policy`)
    );
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
});

// NoSQL injection sanitization
export const sanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
});

// HTTP Parameter Pollution prevention
export const hppMiddleware = hpp();
