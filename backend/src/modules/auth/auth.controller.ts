// Auth Module - Exports re-exported from original controller
// Façade pattern: allows modules to work while we migrate business logic

import { Request, Response } from 'express';
import * as userService from '../../services/userService';
import { generateUserToken, generateRefreshToken } from '../../config/userJwt';
import { isStrongPassword, isValidEmail, isValidPhone, validateRequiredFields } from '../../utils/validators';
import { generateVerificationCode, generateExpiry, isExpired } from '../../utils/passwordUtil';
import { shouldLockAccount, isAccountLocked, calculateUnlockTime, getLockedAccountMessage } from '../../utils/securityUtil';
import * as emailService from '../../services/emailService';
import { blacklistToken } from '../../services/tokenBlacklistService';

// Business Signup
export const businessSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { businessName, email, password, phone } = req.body;

    const validation = validateRequiredFields(
      { businessName, email, password, phone },
      ['businessName', 'email', 'password', 'phone']
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: validation.missingFields
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    if (await userService.businessEmailExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = generateExpiry(900);

    const result = await userService.registerBusiness({
      businessName,
      email,
      password,
      phone,
      verificationCode,
      verificationCodeExpiry
    });

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    await emailService.sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: 'Business registered successfully. Please verify your email.',
      email: result.email,
      requiresVerification: true,
      verificationCodeSent: true
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Signup failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Recycler Signup
export const recyclerSignup = async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName, email, password, phone, specialization } = req.body;

    const validation = validateRequiredFields(
      { companyName, email, password, phone },
      ['companyName', 'email', 'password', 'phone']
    );

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields: validation.missingFields
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const passwordCheck = isStrongPassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    if (await userService.recyclerEmailExists(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = generateExpiry(900);

    const result = await userService.registerRecycler({
      companyName,
      email,
      password,
      phone,
      specialization,
      verificationCode,
      verificationCodeExpiry
    });

    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }

    await emailService.sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      message: 'Recycler registered successfully. Please verify your email.',
      email: result.email,
      requiresVerification: true,
      verificationCodeSent: true
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Signup failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify Email
export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

    if (!user) {
      user = await userService.findRecyclerByEmail(email);
      type = 'recycler';
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    if (user.verificationCodeExpiry && isExpired(user.verificationCodeExpiry)) {
      return res.status(400).json({ error: 'Verification code has expired' });
    }

    const updatedUser = await userService.verifyUserEmail(email, type);

    if ('error' in updatedUser) {
      return res.status(400).json({ error: (updatedUser as any).error });
    }

    const tokenData: any = {
      id: updatedUser.id,
      email: updatedUser.email,
      type: updatedUser.type
    };

    if (type === 'business') {
      tokenData.businessName = (updatedUser as any).businessName;
    } else {
      tokenData.companyName = (updatedUser as any).companyName;
    }

    const accessToken = generateUserToken(tokenData);
    const refreshToken = generateRefreshToken(tokenData);

    res.status(200).json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        type: updatedUser.type,
        name: type === 'business' ? (updatedUser as any).businessName : (updatedUser as any).companyName
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Email verification failed' });
  }
};

// Business Login
export const businessLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const business = await userService.findBusinessByEmail(email);

    if (!business) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isAccountLocked(business.isLocked || false, business.lockedUntil || null)) {
      return res.status(403).json({
        error: getLockedAccountMessage(business.lockedUntil!)
      });
    }

    const isValid = await userService.verifyBusinessCredentials(email, password);
    if (!isValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const newAttempts = (business.loginAttempts || 0) + 1;

      if (shouldLockAccount(newAttempts, maxAttempts)) {
        await userService.lockUserAccount(email, 'business');
        return res.status(403).json({
          error: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      } else {
        await userService.incrementLoginAttempts(email, 'business', newAttempts);
        return res.status(401).json({
          error: 'Invalid email or password',
          remainingAttempts: maxAttempts - newAttempts
        });
      }
    }

    if (!business.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in'
      });
    }

    await userService.resetLoginAttempts(email, 'business');

    const token = generateUserToken({
      id: business.id,
      email: business.email,
      businessName: business.businessName,
      type: 'business'
    });

    const refreshToken = generateRefreshToken({
      id: business.id,
      email: business.email,
      businessName: business.businessName,
      type: 'business'
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: business.id,
        email: business.email,
        type: business.type
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Recycler Login
export const recyclerLogin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const recycler = await userService.findRecyclerByEmail(email);

    if (!recycler) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (isAccountLocked(recycler.isLocked || false, recycler.lockedUntil || null)) {
      return res.status(403).json({
        error: getLockedAccountMessage(recycler.lockedUntil!)
      });
    }

    const isValid = await userService.verifyRecyclerCredentials(email, password);
    if (!isValid) {
      const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5');
      const newAttempts = (recycler.loginAttempts || 0) + 1;

      if (shouldLockAccount(newAttempts, maxAttempts)) {
        await userService.lockUserAccount(email, 'recycler');
        return res.status(403).json({
          error: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      } else {
        await userService.incrementLoginAttempts(email, 'recycler', newAttempts);
        return res.status(401).json({
          error: 'Invalid email or password',
          remainingAttempts: maxAttempts - newAttempts
        });
      }
    }

    if (!recycler.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in'
      });
    }

    await userService.resetLoginAttempts(email, 'recycler');

    const token = generateUserToken({
      id: recycler.id,
      email: recycler.email,
      companyName: recycler.companyName,
      type: 'recycler'
    });

    const refreshToken = generateRefreshToken({
      id: recycler.id,
      email: recycler.email,
      companyName: recycler.companyName,
      type: 'recycler'
    });

    res.status(200).json({
      message: 'Login successful',
      accessToken: token,
      refreshToken: refreshToken,
      user: {
        id: recycler.id,
        email: recycler.email,
        type: recycler.type
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Forgot Password - Send reset email
export const forgotPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email exists in either business or recycler
    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

    if (!user) {
      user = await userService.findRecyclerByEmail(email);
      type = 'recycler';
    }

    // Always return success even if email doesn't exist (security best practice)
    if (!user) {
      return res.status(200).json({
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const resetTokenExpiry = generateExpiry(3600); // 1 hour expiry

    // Save reset code to user
    await userService.setPasswordResetToken(email, type, resetCode, resetTokenExpiry);

    // Send reset email
    await emailService.sendPasswordResetEmail(email, resetCode);

    res.status(200).json({
      message: 'Password reset link has been sent to your email.'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to process password reset request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Reset Password - Verify code and update password
export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email exists and get user type
    let user: any = await userService.findBusinessByEmail(email);
    let type: 'business' | 'recycler' = 'business';

    if (!user) {
      user = await userService.findRecyclerByEmail(email);
      type = 'recycler';
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify reset code
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Check if code has expired
    if (user.resetTokenExpiry && isExpired(user.resetTokenExpiry)) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    // Validate new password
    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    // Validate password against history
    const validation = await userService.validateResetPassword(email, newPassword);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Update password
    await userService.updateUserPassword(email, type, newPassword);

    res.status(200).json({
      message: 'Password has been reset successfully. Please login with your new password.'
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to reset password',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await blacklistToken(token);
    }

    res.status(200).json({
      message: 'Logout successful'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed' });
  }
};

// Verify Token - Check if JWT token is valid
export const verifyToken = async (req: Request, res: Response): Promise<any> => {
  try {
    // If we reach here, the token is valid (authMiddleware passed)
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ 
        valid: false,
        error: 'Invalid token' 
      });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        type: user.type
      }
    });
  } catch (error: any) {
    res.status(401).json({ 
      valid: false,
      error: 'Token verification failed'
    });
  }
};
