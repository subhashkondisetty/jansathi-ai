import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve root .env via absolute path
const candidatePaths = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), '.env'),
];
const envPath = candidatePaths.find((p) => fs.existsSync(p)) || candidatePaths[0];

dotenv.config({ path: envPath });

export const extractMongoHosts = (uri) => {
  if (!uri || typeof uri !== 'string') return [];
  try {
    const withoutScheme = uri.replace(/^mongodb(?:\+srv)?:\/\//i, '');
    const authority = withoutScheme.split('/')[0].split('?')[0];
    const atIdx = authority.lastIndexOf('@');
    const hostpart = atIdx !== -1 ? authority.slice(atIdx + 1) : authority;
    return hostpart
      .split(',')
      .map((h) => {
        const trimmed = h.trim();
        if (trimmed.startsWith('[')) {
          const closeIdx = trimmed.indexOf(']');
          return closeIdx !== -1 ? trimmed.slice(1, closeIdx).toLowerCase() : trimmed.toLowerCase();
        }
        return trimmed.split(':')[0].trim().toLowerCase();
      })
      .filter(Boolean);
  } catch {
    return [];
  }
};

export const isLocalhostAddress = (host) => {
  if (!host || typeof host !== 'string') return false;
  const h = host.trim().toLowerCase();
  return (
    h === 'localhost' ||
    h.endsWith('.localhost') ||
    h === '127.0.0.1' ||
    h.startsWith('127.') ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h === '::'
  );
};

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().default(5000),
    CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
    MONGODB_URI: z.string().optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    BODY_LIMIT: z.string().default('100kb'),
    TRUST_PROXY: z.coerce.number().default(0),
    RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(300),
    RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
    RATE_LIMIT_AI_PER_MIN: z.coerce.number().default(20),
    RATE_LIMIT_UPLOAD_PER_HOUR: z.coerce.number().default(10),
    JWT_SECRET: z.string().min(32).default('jansathi-development-secret-jwt-key-2026'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(16).default(12),
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_NAME: z.string().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    AUDIT_LOG_TTL_DAYS: z.coerce.number().int().positive().default(180),
    MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
    MAX_PDF_PAGES: z.coerce.number().positive().default(300),
    STORAGE_DIR: z
      .string()
      .default(path.resolve(__dirname, '../../storage/uploads'))
      .transform((dir) => path.resolve(dir)),
    AUTO_INDEX: z
      .union([z.boolean(), z.string()])
      .transform((val) => (typeof val === 'boolean' ? val : val !== 'false'))
      .default(true),
    INGESTION_WORKER_ENABLED: z
      .union([z.boolean(), z.string()])
      .transform((val) => (typeof val === 'boolean' ? val : val !== 'false'))
      .default(true),
    INGESTION_CONCURRENCY: z.coerce.number().int().min(1).max(5).default(1),
    INGESTION_POLL_INTERVAL_MS: z.coerce.number().int().min(500).default(3000),
    INGESTION_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
    INGESTION_RETRY_BASE_DELAY_MS: z.coerce.number().int().min(1000).default(5000),
    INGESTION_STALE_MINUTES: z.coerce.number().int().min(1).default(10),
    FETCH_TIMEOUT_MS: z.coerce.number().int().min(1000).default(20000),
    MAX_FETCH_MB: z.coerce.number().positive().default(25),
    FETCH_USER_AGENT: z.string().default('JanSathiBot/1.0'),
    CHUNK_TARGET_CHARS: z.coerce.number().int().min(100).default(1000),
    CHUNK_MAX_CHARS: z.coerce.number().int().min(200).default(1500),
    CHUNK_OVERLAP_CHARS: z.coerce.number().int().min(0).default(150),
    ENABLE_OCR: z
      .union([z.boolean(), z.string()])
      .transform((val) => (typeof val === 'boolean' ? val : val === 'true' || val === '1'))
      .default(false),
    KEEP_UPLOADED_FILES: z
      .union([z.boolean(), z.string()])
      .transform((val) => (typeof val === 'boolean' ? val : val === 'true' || val === '1'))
      .default(false),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === 'production') {
      if (!data.MONGODB_URI || data.MONGODB_URI.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['MONGODB_URI'],
          message: 'MONGODB_URI is required in production mode',
        });
      } else {
        const hosts = extractMongoHosts(data.MONGODB_URI);
        if (hosts.length === 0 || hosts.some(isLocalhostAddress)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['MONGODB_URI'],
            message: 'MONGODB_URI cannot point to localhost or local addresses in production mode',
          });
        }
      }
      if (
        data.JWT_SECRET === 'jansathi-development-secret-jwt-key-2026' ||
        data.JWT_SECRET === 'dev-secret-change-me'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message: 'Default development JWT_SECRET cannot be used in production mode',
        });
      }
    }
  })
  .transform((data) => ({
    ...data,
    MONGODB_URI:
      data.NODE_ENV !== 'production' && (!data.MONGODB_URI || data.MONGODB_URI.trim() === '')
        ? 'mongodb://127.0.0.1:27017/jansathi'
        : data.MONGODB_URI,
  }));

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  process.stderr.write('Environment configuration validation failed:\n');
  parsed.error.issues.forEach((issue) => {
    process.stderr.write(`  [${issue.path.join('.')}] ${issue.message}\n`);
  });
  process.exit(1);
}

export const env = parsed.data;
