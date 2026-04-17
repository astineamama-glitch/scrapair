import bcryptjs from 'bcryptjs';

/**
 * SECURITY UTILITY FOR PASSWORD HISTORY
 * Prevents users from reusing old passwords
 */

export const addPasswordToHistory = (currentPasswordHash: string, passwordHistory: string | null): string => {
  try {
    let history: string[] = [];
    
    if (passwordHistory) {
      history = JSON.parse(passwordHistory);
    }
    
    // Add new password to beginning
    history.unshift(currentPasswordHash);
    
    // Keep only last 5 passwords
    if (history.length > 5) {
      history = history.slice(0, 5);
    }
    
    return JSON.stringify(history);
  } catch (error) {
    return JSON.stringify([currentPasswordHash]);
  }
};

export const isPasswordInHistory = async (newPassword: string, passwordHistory: string | null): Promise<boolean> => {
  try {
    if (!passwordHistory) {
      return false;
    }

    const history: string[] = JSON.parse(passwordHistory);
    
    // Check if new password matches any in history
    for (const oldPasswordHash of history) {
      const matches = await bcryptjs.compare(newPassword, oldPasswordHash);
      if (matches) {
        return true; // Password reuse detected
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
};

export const getPasswordHistoryInfo = (passwordHistory: string | null): number => {
  try {
    if (!passwordHistory) {
      return 0;
    }
    
    const history: string[] = JSON.parse(passwordHistory);
    return history.length;
  } catch (error) {
    return 0;
  }
};

export const clearPasswordHistory = (): string => {
  return JSON.stringify([]);
};

