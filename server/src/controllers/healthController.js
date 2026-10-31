import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export const getHealth = (req, res) => {
  return sendSuccess(res, {
    status: 'ok',
    service: 'jansathi-ai-server',
    environment: env.NODE_ENV,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
