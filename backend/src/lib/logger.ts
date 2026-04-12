import pino from 'pino';
import pinoHttp from 'pino-http';

/**
 * Configuração de Logger Pino
 * - Em desenvolvimento: output pretty-printed
 * - Em produção: output estruturado (JSON)
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      }
    : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Middleware HTTP Logger para Express
 */
export const httpLogger = pinoHttp({
  logger,
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} - ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} - ${res.statusCode} - Error: ${err.message}`;
  },
});

export default logger;
