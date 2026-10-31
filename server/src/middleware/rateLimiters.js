import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { env } from '../config/env.js';

// Safe rate limit error response builder
const createRateLimitHandler = (windowMs) => (req, res, _next, _options) => {
  const retryHeader = res.getHeader('Retry-After');
  const retryAfterSeconds = retryHeader ? parseInt(retryHeader, 10) : Math.ceil(windowMs / 1000);

  res.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
      details: {
        retryAfterSeconds,
      },
      requestId: req.id,
    },
  });
};

const userOrIpKeyGenerator = (req) => {
  if (req.user?.id) {
    return `user_${req.user.id}`;
  }
  return ipKeyGenerator(req);
};

// Global rate limiter (15 minutes window)
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(15 * 60 * 1000),
});

// Authentication endpoints limiter (15 minutes window)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.RATE_LIMIT_AUTH_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: createRateLimitHandler(15 * 60 * 1000),
});

// AI endpoints limiter (1 minute window, keyed by user ID or IP)
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: env.RATE_LIMIT_AI_PER_MIN,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: userOrIpKeyGenerator,
  handler: createRateLimitHandler(1 * 60 * 1000),
});

// Upload endpoints limiter (1 hour window, keyed by user ID or IP)
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: env.RATE_LIMIT_UPLOAD_PER_HOUR,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: userOrIpKeyGenerator,
  handler: createRateLimitHandler(60 * 60 * 1000),
});
