import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

export const logger = pino({
  level: env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'headers.authorization',
      'headers.cookie',
      'password',
      'token',
      'refreshToken',
      'req.body.password',
      'req.body.token',
      'req.body.refreshToken',
      'body.password',
      'body.token',
      'body.refreshToken',
    ],
    censor: '[REDACTED]',
  },
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.id || req.headers['x-request-id'],
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url ? req.url.split('?')[0] : '',
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
  customSuccessMessage: (req, res, responseTime) => {
    const cleanUrl = req.url ? req.url.split('?')[0] : '';
    return `${req.method} ${cleanUrl} ${res.statusCode} in ${responseTime}ms [${req.id || ''}]`;
  },
  customErrorMessage: (req, res, err) => {
    const cleanUrl = req.url ? req.url.split('?')[0] : '';
    return `${req.method} ${cleanUrl} ${res.statusCode} - ${err.message} [${req.id || ''}]`;
  },
});

export default logger;
