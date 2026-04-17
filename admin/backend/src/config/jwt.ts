import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
import fs from 'fs';
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : (fs.existsSync(path.join(__dirname, '../../', '.env.local')) ? '.env.local' : '.env');
dotenv.config({ path: path.join(__dirname, '../../', envFile) });

const NODE_ENV = process.env.NODE_ENV || 'development';

interface AdminCredentials {
  username: string;
  password: string;
}

// Read credentials lazily to ensure dotenv has loaded
const getAdminCredentials = (): AdminCredentials => ({
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || ''
});



// Validate admin credentials are properly configured
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === '') {
  if (NODE_ENV === 'production') {
    throw new Error('❌ CRITICAL: ADMIN_PASSWORD must be set in production environment');
  }
}

// Validate JWT_SECRET
const JWT_SECRET: Secret = process.env.JWT_SECRET || (NODE_ENV === 'development' ? 'dev_jwt_secret_key_12345678' : '');

if (!process.env.JWT_SECRET && NODE_ENV === 'production') {
  throw new Error('❌ CRITICAL: JWT_SECRET must be set in production environment');
}

const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

interface AdminPayload {
  username: string;
  role: string;
  loginTime: string;
}

/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const verifyCredentials = (username: string, password: string): boolean => {
  const creds = getAdminCredentials();
  if (!creds.password) {
    console.warn('⚠️  WARNING: ADMIN_PASSWORD is not set in environment variables!');
  }
  return username === creds.username && password === creds.password;
};

/**
 * @param {AdminPayload} payload 
 * @returns {string} 
 */
const generateToken = (payload: AdminPayload): string => {
  const options: SignOptions = { expiresIn: JWT_EXPIRATION } as any;
  return jwt.sign(payload, JWT_SECRET as string, options);
};

/**
 * @param {string} token
 * @returns {AdminPayload | null} 
 */
const verifyToken = (token: string): AdminPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch (error) {
    return null;
  }
};

export { getAdminCredentials, JWT_SECRET, JWT_EXPIRATION, verifyCredentials, generateToken, verifyToken };
export type { AdminPayload };
