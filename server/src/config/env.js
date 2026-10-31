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
