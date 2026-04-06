import path from 'path';
import fs from 'fs';
import { createLogger, format, transports, Logger } from 'winston';

const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const isProd = process.env.NODE_ENV === 'production';

// Winston custom colors for levels
const customColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'gray',
};
format.colorize().addColors(customColors);

const consoleFormat = format.combine(
  format.colorize({ all: true }), // colorize everything, not just level
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
    const ctx = context ? `[${context}] ` : '';
    const metaStr = Object.keys(meta).length
      ? ` | meta: ${JSON.stringify(meta)}`
      : '';
    return `${timestamp} ${level} ${ctx}${message}${stack ? `\n${stack}` : ''}${metaStr}`;
  }),
);

const fileFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

export const logger: Logger = createLogger({
  level: isProd ? 'warn' : 'debug',
  format: isProd ? fileFormat : consoleFormat,
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: fileFormat,
    }),
  ],
});
