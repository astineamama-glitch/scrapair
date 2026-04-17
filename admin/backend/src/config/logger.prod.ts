import winston from 'winston';

const prodLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`;
  })
);

const prodTransports: winston.transport[] = [
  new winston.transports.Console({
    format: prodLogFormat
  })
];

const prodLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'warn', 
  format: prodLogFormat,
  transports: prodTransports,
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `[${timestamp}] [${level.toUpperCase()}] UNCAUGHT EXCEPTION: ${message}${stack ? '\n' + stack : ''}`;
        })
      )
    })
  ]
});

export default prodLogger;
