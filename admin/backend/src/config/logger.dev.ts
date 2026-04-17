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
    maxsize: 10485760, 
    maxFiles: 5,
    format: devLogFormat
  }),
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    maxsize: 10485760, 
    maxFiles: 5,
    format: devLogFormat
  })
];

const devLogger = winston.createLogger({
  level: 'info',
  format: devLogFormat,
  transports: devTransports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: devLogFormat
    })
  ]
});

export default devLogger;
