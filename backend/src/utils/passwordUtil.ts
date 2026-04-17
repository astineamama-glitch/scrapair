import crypto from 'crypto';

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
export const verifyToken = (token: string, hash: string): boolean => {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
};
export const generateExpiry = (durationSeconds: number): Date => {
  return new Date(Date.now() + durationSeconds * 1000);
};
export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};
