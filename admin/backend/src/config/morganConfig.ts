import morgan from 'morgan';
import { Request, Response } from 'express';

const NODE_ENV = process.env.NODE_ENV || 'development';
const logger = NODE_ENV === 'production' 
  ? require('./logger.prod').default 
  : require('./logger.dev').default;

morgan.token('response-time-ms', (req: any, res: any) => {
  if (!(res as any)._header) return '';
  const diff = Date.now() - ((req as any)._startTime || Date.now());
  return diff.toString();
});

const httpLogFormat = ':method :url :status :response-time-ms ms - :res[content-length] bytes';

const morganMiddleware = morgan(httpLogFormat, {
  stream: {
    write: (message: string) => {
      if (message.includes('/api/health') || message.includes('/health')) {
        return;
      }
      
      if (NODE_ENV === 'production') {
        return;
      }
      
      logger.info(message.trim());
    }
  },
  skip: (req: Request, res: Response) => {
    return req.path === '/api/health' || req.path === '/health' || req.path === '/status';
  }
});

export default morganMiddleware;
