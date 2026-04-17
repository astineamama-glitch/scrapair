import morgan from 'morgan';

const logger = process.env.NODE_ENV === 'production'
  ? require('./logger.prod').default
  : require('./logger.dev').default;

morgan.token('response-time-ms', (req: any, res: any) => {
  if (!res._header || !req._startTime) return '0ms';
  return `${Date.now() - req._startTime}ms`;
});

const stream = {
  write: (message: string) => {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    logger.info(message.trim());
  }
};

const morganMiddleware = morgan(
  ':method :url :status :response-time-ms - :res[content-length] bytes',
  {
    stream: stream,
    skip: (req: any) => {
      return req.path === '/api/health' || req.path === '/health';
    }
  }
);

export default morganMiddleware;
