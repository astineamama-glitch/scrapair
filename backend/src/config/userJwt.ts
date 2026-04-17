import jwt, { Secret, SignOptions } from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('❌ CRITICAL: JWT_SECRET environment variable is required!');
}

const JWT_SECRET: Secret = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';
const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || 'dev_refresh_secret_change_in_prod';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '30d';

interface UserPayload {
  id: number;
  email: string;
  businessName?: string;
  companyName?: string;
  type: 'business' | 'recycler';
}

const generateUserToken = (payload: UserPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRATION } as any;
  return jwt.sign(payload, JWT_SECRET as string, options);
};

const generateRefreshToken = (payload: UserPayload): string => {
  const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRATION } as any;
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as string, options);
};

const verifyUserToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
};

const verifyRefreshToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
};

export { 
  JWT_SECRET, 
  JWT_EXPIRATION, 
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRATION,
  generateUserToken, 
  generateRefreshToken,
  verifyUserToken,
  verifyRefreshToken 
};
export type { UserPayload };
