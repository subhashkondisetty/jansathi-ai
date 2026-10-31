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

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/jansathi'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  BODY_LIMIT: z.string().default('100kb'),
  TRUST_PROXY: z.coerce.number().default(0),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(300),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().default(10),
  RATE_LIMIT_AI_PER_MIN: z.coerce.number().default(20),
  RATE_LIMIT_UPLOAD_PER_HOUR: z.coerce.number().default(10),
  AUDIT_LOG_TTL_DAYS: z.coerce.number().int().positive().default(180),
  AUTO_INDEX: z
    .union([z.boolean(), z.string()])
    .transform((val) => (typeof val === 'boolean' ? val : val !== 'false'))
    .default(true),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  process.stderr.write('Environment configuration validation failed:\n');
  parsed.error.issues.forEach((issue) => {
    process.stderr.write(`  [${issue.path.join('.')}] ${issue.message}\n`);
  });
  process.exit(1);
}

export const env = parsed.data;
