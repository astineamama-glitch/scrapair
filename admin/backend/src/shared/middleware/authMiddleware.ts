import { Request, Response, NextFunction } from 'express';
import { verifyToken, AdminPayload } from '../config/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

const authenticate = (req: Request, res: Response, next: NextFunction): any => {
  try {
    console.log('[AUTH] Middleware called for:', req.method, req.path);
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      console.log('[AUTH] No authorization header found');
      return res.status(401).json({
        error: 'Authorization header is missing'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token is missing'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    console.log('[AUTH] Decoded token:', decoded);
    req.admin = decoded;
    console.log('[AUTH] req.admin set to:', req.admin);
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Authentication error'
    });
  }
};

export { authenticate };
