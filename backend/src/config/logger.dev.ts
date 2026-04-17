import winston from 'winston';
import path from 'path';

const devLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

const logsDir = path.join(__dirname, '../../logs');
const devTransports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp }) => {
        return `[${timestamp}] [${level}] ${message}`;
      })
    )
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: devLogFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: devLogFormat,
    maxsize: 10485760, 
    maxFiles: 5
  })
];

const devLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: devLogFormat,
  transports: devTransports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) => {
          return `[${timestamp}] [${level}] 🔴 EXCEPTION: ${message}`;
        })
      )
    })
  ]
});

export default devLogger;
