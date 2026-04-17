import { Request, Response, NextFunction } from 'express';
import { verifyUserToken, UserPayload } from '../config/userJwt';
import { isTokenBlacklisted } from '../services/tokenBlacklistService';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
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

    // ✅ Check if token is blacklisted
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      return res.status(401).json({
        error: 'Token has been invalidated. Please login again.'
      });
    }

    const decoded = verifyUserToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid or expired token'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication error'
    });
  }
};

export { authenticateUser };
