import { Request, Response } from 'express';
import * as userService from '../../services/userService';
import { isValidPhone, isStrongPassword } from '../../utils/validators';
import * as emailService from '../../services/emailService';
import { logPasswordAudit } from '../../utils/passwordAuditUtil';

export const getUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let userDetails: any;
    if (user.type === 'business') {
      userDetails = await userService.findBusinessByEmail(user.email);
    } else {
      userDetails = await userService.findRecyclerByEmail(user.email);
    }

    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profileData: any = {
      id: userDetails.id,
      email: userDetails.email,
      type: userDetails.type,
      phone: userDetails.phone,
      isVerified: userDetails.isVerified
    };

    if (user.type === 'business' && userDetails.businessName) {
      profileData.businessName = userDetails.businessName;
    }
    if (user.type === 'recycler' && userDetails.companyName) {
      profileData.companyName = userDetails.companyName;
    }
    if (user.type === 'recycler' && userDetails.specialization) {
      profileData.specialization = userDetails.specialization;
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user: profileData
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { phone, businessName, companyName, specialization } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const updates: any = {};
    if (phone) updates.phone = phone;
    if (businessName) updates.businessName = businessName;
    if (companyName) updates.companyName = companyName;
    if (specialization) updates.specialization = specialization;

    const updatedUser = await userService.updateUserProfile(user.email, user.type, updates);

    if ('error' in updatedUser) {
      return res.status(400).json({ error: (updatedUser as any).error });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const validation = await userService.validateNewPassword(
      user.email,
      user.type,
      currentPassword,
      newPassword
    );

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const passwordCheck = isStrongPassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        error: 'New password does not meet security requirements',
        requirements: passwordCheck.errors
      });
    }

    await userService.updateUserPassword(user.email, user.type, newPassword);

    res.status(200).json({
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const deleteUserAccount = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.user;
    const { password } = req.body;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const result = await userService.deleteUserAccount(user.email, user.type);

    if ('error' in result) {
      return res.status(400).json({ error: (result as any).error });
    }

    res.status(200).json({
      message: 'Account deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
