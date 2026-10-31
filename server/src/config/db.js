import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Configure reliable DNS servers to resolve MongoDB Atlas SRV records across local/ISP networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Fallback to default system resolver if setting custom servers is restricted
}

// Redact credentials in connection string for safe logging
const redactMongoUri = (uri) => {
  if (!uri) return '';
  return uri.replace(/\/\/(.*?)@/, '//***:***@');
};

let eventListenersRegistered = false;

const registerEventListeners = () => {
  if (eventListenersRegistered) return;
  eventListenersRegistered = true;

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connection established');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection runtime error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection disconnected');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB connection re-established');
  });
};

export const connectDb = async () => {
  if (!env.MONGODB_URI) {
    logger.warn('MONGODB_URI is not set. Database connection skipped.');
    return;
  }

  registerEventListeners();

  const maxAttempts = 3;
  let attempt = 0;
  const safeUri = redactMongoUri(env.MONGODB_URI);

  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      logger.info({ uri: safeUri, attempt, maxAttempts }, 'Connecting to MongoDB...');
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      return;
    } catch (err) {
      logger.error({ err: err.message, attempt, maxAttempts }, 'Failed to connect to MongoDB');
      if (attempt >= maxAttempts) {
        throw err;
      }
      const backoffMs = Math.pow(2, attempt - 1) * 1000;
      logger.info(`Waiting ${backoffMs}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
};

export const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  }
};

export const isDbReady = () => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = connectDb;
export const disconnectDB = disconnectDb;
