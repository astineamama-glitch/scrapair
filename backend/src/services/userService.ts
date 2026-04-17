import { calculateUnlockTime } from '../utils/securityUtil';
import { User, sequelize } from '../models';
import bcryptjs from 'bcryptjs';
import { addPasswordToHistory, isPasswordInHistory } from '../utils/passwordSecurityUtil';
import { redisClient } from '../config/redis';

interface BusinessData {
  businessName: string;
  email: string;
  password: string;
  phone: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
}

interface RecyclerData {
  companyName: string;
  email: string;
  password: string;
  phone: string;
  specialization?: string;
  verificationCode?: string;
  verificationCodeExpiry?: Date;
}

interface ErrorResult {
  error: string;
}

interface UserResult {
  id: number;
  type: string;
  email: string;
  businessName?: string;
  companyName?: string;
  isVerified: boolean;
  loginAttempts: number;
  isLocked: boolean;
  lockedUntil?: Date;
  [key: string]: any;
}
const businessEmailExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ where: { email, type: 'business' } });
  return !!user;
};
const recyclerEmailExists = async (email: string): Promise<boolean> => {
  const user = await User.findOne({ where: { email, type: 'recycler' } });
  return !!user;
};
const registerBusiness = async (businessData: BusinessData): Promise<UserResult | ErrorResult> => {
  try {
    if (await businessEmailExists(businessData.email)) {
      return { error: 'Email already registered' };
    }

    const newBusiness = await User.create({
      type: 'business',
      businessName: businessData.businessName,
      email: businessData.email,
      password: businessData.password,
      phone: businessData.phone,
      isVerified: false,
      verificationCode: businessData.verificationCode,
      verificationCodeExpiry: businessData.verificationCodeExpiry,
      loginAttempts: 0,
      isLocked: false
    });

    return {
      id: newBusiness.id!,
      type: newBusiness.type,
      email: newBusiness.email,
      businessName: newBusiness.businessName,
      isVerified: newBusiness.isVerified!,
      loginAttempts: newBusiness.loginAttempts!,
      isLocked: newBusiness.isLocked!
    };
  } catch (error: any) {
    return { error: error.message || 'Registration failed' };
  }
};
const registerRecycler = async (recyclerData: RecyclerData): Promise<UserResult | ErrorResult> => {
  try {
    if (await recyclerEmailExists(recyclerData.email)) {
      return { error: 'Email already registered' };
    }

    const newRecycler = await User.create({
      type: 'recycler',
      companyName: recyclerData.companyName,
      email: recyclerData.email,
      password: recyclerData.password,
      phone: recyclerData.phone,
      specialization: recyclerData.specialization || '',
      isVerified: false,
      verificationCode: recyclerData.verificationCode,
      verificationCodeExpiry: recyclerData.verificationCodeExpiry,
      loginAttempts: 0,
      isLocked: false
    });

    return {
      id: newRecycler.id!,
      type: newRecycler.type,
      email: newRecycler.email,
      companyName: newRecycler.companyName,
      isVerified: newRecycler.isVerified!,
      loginAttempts: newRecycler.loginAttempts!,
      isLocked: newRecycler.isLocked!
    };
  } catch (error: any) {
    return { error: error.message || 'Registration failed' };
  }
};

const findBusinessByEmail = async (email: string): Promise<UserResult | null> => {
  try {
    const user = await User.findOne({ where: { email, type: 'business' } });
    if (!user) return null;
    return {
      id: user.id!,
      type: user.type,
      email: user.email,
      businessName: user.businessName,
      password: user.password,
      phone: user.phone,
      isVerified: user.isVerified!,
      verificationCode: user.verificationCode,
      verificationCodeExpiry: user.verificationCodeExpiry,
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
      loginAttempts: user.loginAttempts!,
      isLocked: user.isLocked!,
      lockedUntil: user.lockedUntil
    };
  } catch (error) {
    return null;
  }
};
const findRecyclerByEmail = async (email: string): Promise<UserResult | null> => {
  try {
    const user = await User.findOne({ where: { email, type: 'recycler' } });
    if (!user) return null;
    return {
      id: user.id!,
      type: user.type,
      email: user.email,
      companyName: user.companyName,
      password: user.password,
      phone: user.phone,
      specialization: user.specialization,
      isVerified: user.isVerified!,
      verificationCode: user.verificationCode,
      verificationCodeExpiry: user.verificationCodeExpiry,
      resetToken: user.resetToken,
      resetTokenExpiry: user.resetTokenExpiry,
      loginAttempts: user.loginAttempts!,
      isLocked: user.isLocked!,
      lockedUntil: user.lockedUntil
    };
  } catch (error) {
    return null;
  }
};

const verifyBusinessCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    const user = await findBusinessByEmail(email);
    if (!user) return false;
    return await bcryptjs.compare(password, user.password);
  } catch (error) {
    return false;
  }
};

const verifyRecyclerCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    const user = await findRecyclerByEmail(email);
    if (!user) return false;
    return await bcryptjs.compare(password, user.password);
  } catch (error) {
    return false;
  }
};

const verifyUserEmail = async (email: string, type: 'business' | 'recycler'): Promise<UserResult | ErrorResult> => {
  try {
    const user = await User.findOne({ where: { email, type } });
    if (!user) return { error: 'User not found' };
    
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();
    
    return {
      id: user.id!,
      type: user.type,
      email: user.email,
      businessName: user.businessName,
      companyName: user.companyName,
      isVerified: user.isVerified!,
      loginAttempts: user.loginAttempts!,
      isLocked: user.isLocked!
    };
  } catch (error: any) {
    return { error: error.message || 'Verification failed' };
  }
};

const incrementLoginAttempts = async (email: string, type: 'business' | 'recycler', attempts: number): Promise<void> => {
  try {
    await User.update(
      { loginAttempts: attempts, lastLoginAttempt: new Date() },
      { where: { email, type } }
    );
  } catch (error) {
  }
};
const resetLoginAttempts = async (email: string, type: 'business' | 'recycler'): Promise<void> => {
  try {
    await User.update(
      { loginAttempts: 0, isLocked: false, lockedUntil: null },
      { where: { email, type } }
    );
  } catch (error) {
  }
};
const lockUserAccount = async (email: string, type: 'business' | 'recycler'): Promise<void> => {
  try {
    await User.update(
      { isLocked: true, lockedUntil: calculateUnlockTime() },
      { where: { email, type } }
    );
  } catch (error) {
  }
};
const setPasswordResetToken = async (
  email: string,
  type: 'business' | 'recycler',
  resetCode: string,
  resetTokenExpiry: Date
): Promise<void> => {
  try {
    await User.update(
      { verificationCode: resetCode, resetTokenExpiry },
      { where: { email, type } }
    );
  } catch (error) {
  }
};

const updateUserPassword = async (email: string, type: 'business' | 'recycler', newPassword: string): Promise<void> => {
  try {
    // Get current user to access password history
    const user = await User.findOne({ where: { email, type } });
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    // Add current password hash to history before updating
    const newPasswordHistory = addPasswordToHistory(user.password, user.passwordHistory);

    await User.update(
      { 
        password: hashedPassword, 
        verificationCode: null, 
        resetTokenExpiry: null,
        passwordHistory: newPasswordHistory
      },
      { where: { email, type } }
    );

    // Clear password reset token from Redis cache if it exists
    try {
      await redisClient.del(`pwd_reset:${email}`);
    } catch (redisError) {
      // Non-critical Redis failure, log but don't throw
      console.warn(`Failed to clear Redis password reset token for ${email}:`, redisError);
    }
  } catch (error: any) {
    // Throw error so caller can handle it properly
    throw new Error(`Password update failed: ${error.message}`);
  }
};

const updateUserProfile = async (
  email: string,
  type: 'business' | 'recycler',
  updates: { phone?: string; businessName?: string; companyName?: string; specialization?: string }
): Promise<UserResult | ErrorResult> => {
  try {
    const updateData: any = {};
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.businessName && type === 'business') updateData.businessName = updates.businessName;
    if (updates.companyName && type === 'recycler') updateData.companyName = updates.companyName;
    if (updates.specialization && type === 'recycler') updateData.specialization = updates.specialization;

    const user = await User.findOne({ where: { email, type } });
    if (!user) return { error: 'User not found' };

    await user.update(updateData);
    return {
      id: user.id!,
      type: user.type,
      email: user.email,
      phone: user.phone,
      businessName: user.businessName,
      companyName: user.companyName,
      isVerified: user.isVerified!,
      loginAttempts: user.loginAttempts!,
      isLocked: user.isLocked!
    };
  } catch (error: any) {
    return { error: error.message || 'Profile update failed' };
  }
};

const deleteUserAccount = async (email: string, type: 'business' | 'recycler'): Promise<any> => {
  try {
    const user = await User.findOne({ where: { email, type } });
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const { deleteUserWithCascade } = require('./userDeletionService');
    
    try {
      const result = await deleteUserWithCascade(user.id, type, sequelize);
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Failed to delete account' };
      }
    } catch (cascadeError: any) {
      const errorMessage = cascadeError?.message || cascadeError?.error?.message || JSON.stringify(cascadeError);
      console.error('Cascade delete error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  } catch (error: any) {
    console.error('Delete account error:', error.message);
    return { success: false, error: error.message };
  }
};

const validateNewPassword = async (
  email: string,
  type: 'business' | 'recycler',
  currentPassword: string,
  newPassword: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    const user = await User.findOne({ where: { email, type } });
    
    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return { valid: false, error: 'Current password is incorrect' };
    }

    // Check if new password is same as current
    const isSameAsCurrentPassword = await bcryptjs.compare(newPassword, user.password);
    if (isSameAsCurrentPassword) {
      return { valid: false, error: 'New password cannot be the same as current password' };
    }

    // Check password history
    const isReused = await isPasswordInHistory(newPassword, user.passwordHistory);
    if (isReused) {
      return { valid: false, error: 'You cannot reuse one of your last 5 passwords' };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: 'Password validation failed' };
  }
};

const validateResetPassword = async (
  email: string,
  newPassword: string
): Promise<{ valid: boolean; error?: string }> => {
  try {
    let user: any = await User.findOne({ where: { email, type: 'business' } });
    if (!user) {
      user = await User.findOne({ where: { email, type: 'recycler' } });
    }

    if (!user) {
      return { valid: false, error: 'User not found' };
    }

    // Check if new password is same as current
    const isSameAsCurrentPassword = await bcryptjs.compare(newPassword, user.password);
    if (isSameAsCurrentPassword) {
      return { valid: false, error: 'New password cannot be the same as current password' };
    }

    // Check password history
    const isReused = await isPasswordInHistory(newPassword, user.passwordHistory);
    if (isReused) {
      return { valid: false, error: 'You cannot reuse one of your last 5 passwords' };
    }

    return { valid: true };
  } catch (error: any) {
    return { valid: false, error: 'Password validation failed' };
  }
};

export {
  registerBusiness,
  registerRecycler,
  findBusinessByEmail,
  findRecyclerByEmail,
  verifyBusinessCredentials,
  verifyRecyclerCredentials,
  businessEmailExists,
  recyclerEmailExists,
  verifyUserEmail,
  incrementLoginAttempts,
  resetLoginAttempts,
  lockUserAccount,
  setPasswordResetToken,
  updateUserPassword,
  updateUserProfile,
  deleteUserAccount,
  validateNewPassword,
  validateResetPassword
};
export type { BusinessData, RecyclerData, UserResult };

