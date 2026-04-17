export const shouldLockAccount = (
  loginAttempts: number,
  maxAttempts: number = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5')
): boolean => {
  return loginAttempts >= maxAttempts;
};export const isAccountLocked = (
  isLocked: boolean,
  lockedUntil: Date | null
): boolean => {
  if (!isLocked || !lockedUntil) {
    return false;
  }

  if (new Date() > lockedUntil) {
    return false; 
  }

  return true;
};
export const getLockDurationMs = (): number => {
  const durationSeconds = parseInt(process.env.ACCOUNT_LOCK_DURATION || '1800'); 
  return durationSeconds * 1000;
};
export const calculateUnlockTime = (): Date => {
  return new Date(Date.now() + getLockDurationMs());
};

export const getLockedAccountMessage = (lockedUntil: Date): string => {
  const minutesRemaining = Math.ceil((lockedUntil.getTime() - Date.now()) / 60000);
  return `Account is temporarily locked. Try again in ${minutesRemaining} minutes.`;
};
