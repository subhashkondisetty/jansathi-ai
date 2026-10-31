/**
 * @fileoverview CLI tool to bootstrap an administrator or promote an existing user.
 *
 * Usage:
 *   node scripts/createAdmin.js --name "Admin Name" --email "admin@gov.in" --password "StrongPass123"
 *   node scripts/createAdmin.js --email "existing@gov.in" --password "NewStrongPass123" --promote
 */

import { z } from 'zod';
import { connectDb, disconnectDb } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { logger } from '../src/utils/logger.js';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/services/authService.js';
import { emailSchema, passwordSchema } from '../src/validators/authValidators.js';

// Silence operational logs to ensure CLI prints only the user ID
logger.level = 'silent';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {
    promote: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--promote') {
      parsed.promote = true;
    } else if (arg.startsWith('--email=')) {
      parsed.email = arg.split('=')[1];
    } else if (arg === '--email' && i + 1 < args.length) {
      parsed.email = args[++i];
    } else if (arg.startsWith('--name=')) {
      parsed.name = arg.split('=')[1];
    } else if (arg === '--name' && i + 1 < args.length) {
      parsed.name = args[++i];
    } else if (arg.startsWith('--password=')) {
      parsed.password = arg.split('=')[1];
    } else if (arg === '--password' && i + 1 < args.length) {
      parsed.password = args[++i];
    }
  }

  return parsed;
};

const main = async () => {
  const cliArgs = parseArgs();

  const rawEmail = cliArgs.email || env.ADMIN_EMAIL;
  const rawName = cliArgs.name || env.ADMIN_NAME;
  const rawPassword = cliArgs.password || env.ADMIN_PASSWORD;
  const isPromote = cliArgs.promote;

  if (!rawEmail || !rawPassword) {
    process.stderr.write(
      'Error: Missing required admin credentials. Provide --email and --password (or set ADMIN_EMAIL and ADMIN_PASSWORD).\n'
    );
    process.exit(1);
  }

  const adminValidationSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    name: isPromote
      ? z.string().trim().min(2).max(80).optional()
      : z
          .string({ required_error: 'Name is required' })
          .trim()
          .min(2, 'Name must be at least 2 characters')
          .max(80, 'Name cannot exceed 80 characters'),
  });

  const validationResult = adminValidationSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
    name: rawName,
  });

  if (!validationResult.success) {
    process.stderr.write('Validation failed:\n');
    validationResult.error.issues.forEach((issue) => {
      process.stderr.write(`  [${issue.path.join('.')}] ${issue.message}\n`);
    });
    process.exit(1);
  }

  const { email, password, name } = validationResult.data;

  try {
    await connectDb();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!isPromote) {
        process.stderr.write(
          `User with email "${email}" already exists with role "${existingUser.role}". Re-run with --promote to upgrade to admin.\n`
        );
        await disconnectDb();
        process.exit(1);
      }

      existingUser.role = 'admin';
      existingUser.passwordHash = await hashPassword(password);
      if (name) {
        existingUser.name = name;
      }
      existingUser.isActive = true;
      await existingUser.save();

      process.stdout.write(`${existingUser.id}\n`);
    } else {
      const passwordHash = await hashPassword(password);

      const adminUser = await User.create({
        name,
        email,
        passwordHash,
        role: 'admin',
        preferredLanguage: 'en',
        userCategory: 'general_citizen',
        isActive: true,
      });

      process.stdout.write(`${adminUser.id}\n`);
    }

    await disconnectDb();
    process.exit(0);
  } catch (err) {
    process.stderr.write(`Failed to create admin: ${err.message}\n`);
    try {
      await disconnectDb();
    } catch {
      // Ignore disconnect error during cleanup
    }
    process.exit(1);
  }
};

main();
