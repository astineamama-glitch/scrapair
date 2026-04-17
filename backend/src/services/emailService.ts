import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface EmailLog {
  to: string;
  subject: string;
  code: string;
  timestamp: Date;
  type: 'verification' | 'password-reset' | 'verified' | 'deleted';
}

const sentEmails: EmailLog[] = [];
let transporter: any = null;
let resend: Resend | null = null;

// Initialize email transporter based on environment
const initializeEmailService = async () => {
  if (process.env.EMAIL_SERVICE === 'resend') {
    try {
      // Initialize Resend client
      resend = new Resend(process.env.RESEND_API_KEY);
    } catch (error: any) {
      resend = null;
    }
  } else if (process.env.EMAIL_SERVICE === 'ethereal') {
    try {
      // For Ethereal - use credentials from .env
      transporter = nodemailer.createTransport({
        host: process.env.ETHEREAL_HOST || 'smtp.ethereal.email',
        port: parseInt(process.env.ETHEREAL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.ETHEREAL_USER,
          pass: process.env.ETHEREAL_PASSWORD,
        },
      });

      // Test connection
      await transporter.verify();
    } catch (error: any) {
      transporter = null;
    }
  } else {
    // Mock email service
  }
};

// Initialize on module load
initializeEmailService();

export const getSentEmails = (): EmailLog[] => {
  return sentEmails;
};
export const getEmailsForRecipient = (email: string): EmailLog[] => {
  return sentEmails.filter(e => e.to === email);
};
export const clearSentEmails = (): void => {
  sentEmails.length = 0;
};
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    sentEmails.push({
      to: email,
      subject: 'Email Verification - Scrapair',
      code,
      timestamp: new Date(),
      type: 'verification'
    });

    const htmlContent = `
      <h2>Verify Your Email</h2>
      <p>Your verification code is:</p>
      <h1 style="color: #007bff; font-size: 36px; font-weight: bold;">${code}</h1>
      <p>This code will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    if (resend) {
      // Send via Resend
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Email Verification - Scrapair',
        html: htmlContent,
      });
    } else if (transporter) {
      // Send via Ethereal
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Email Verification - Scrapair',
        html: htmlContent,
      });
    } else {
      // Fall back to mock (console logging)
    }

    return { success: true, message: 'Verification email sent' };
  } catch (error: any) {
    return { success: false, message: 'Failed to send verification email' };
  }
};
export const sendPasswordResetEmail = async (
  email: string,
  code: string
): Promise<{ success: boolean; message: string }> => {
  try {
    sentEmails.push({
      to: email,
      subject: 'Password Reset Request - Scrapair',
      code,
      timestamp: new Date(),
      type: 'password-reset'
    });

    // Generate reset link with token
    const frontendUrl = process.env.FRONTEND_BASE_URL;
    if (!frontendUrl) {
      throw new Error('FRONTEND_BASE_URL environment variable is not set');
    }
    const resetLink = `${frontendUrl}/reset-password?email=${encodeURIComponent(email)}&token=${code}`;

    const htmlContent = `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a></p>
      <p>Or copy this link: <code>${resetLink}</code></p>
      <p style="font-size: 12px; color: #666;">Your reset code is: <strong>${code}</strong></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    if (resend) {
      // Send via Resend
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Password Reset Request - Scrapair',
        html: htmlContent,
      });
    } else if (transporter) {
      // Send via Ethereal
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Password Reset Request - Scrapair',
        html: htmlContent,
      });
    } else {
      // Fall back to mock (console logging)
    }

    return { success: true, message: 'Password reset email sent' };
  } catch (error: any) {
    return { success: false, message: 'Failed to send password reset email' };
  }
};
export const sendAccountVerifiedEmail = async (
  email: string,
  userName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    sentEmails.push({
      to: email,
      subject: 'Account Verified - Scrapair',
      code: 'N/A',
      timestamp: new Date(),
      type: 'verified'
    });

    const htmlContent = `
      <h2>Welcome to Scrapair!</h2>
      <p>Hi ${userName},</p>
      <p>Your account has been verified and is now active.</p>
      <p>You can now log in and start using Scrapair.</p>
    `;

    if (resend) {
      // Send via Resend
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Account Verified - Scrapair',
        html: htmlContent,
      });
    } else if (transporter) {
      // Send via Ethereal
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Account Verified - Scrapair',
        html: htmlContent,
      });
    } else {
      // Fall back to mock (console logging)
    }

    return { success: true, message: 'Verification notification sent' };
  } catch (error: any) {
    return { success: false, message: 'Failed to send verification notification' };
  }
};
export const sendAccountDeletedEmail = async (
  email: string,
  userName: string
): Promise<{ success: boolean; message: string }> => {
  try {
    sentEmails.push({
      to: email,
      subject: 'Account Deleted - Scrapair',
      code: 'N/A',
      timestamp: new Date(),
      type: 'deleted'
    });

    const htmlContent = `
      <h2>Account Deletion Confirmed</h2>
      <p>Hi ${userName},</p>
      <p>Your account has been successfully deleted.</p>
      <p>All your data has been removed from our systems.</p>
      <p>If you have any questions, please contact us.</p>
    `;

    if (resend) {
      // Send via Resend
      const result = await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Account Deleted - Scrapair',
        html: htmlContent,
      });
    } else if (transporter) {
      // Send via Ethereal
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@scrapair.com',
        to: email,
        subject: 'Account Deleted - Scrapair',
        html: htmlContent,
      });
    } else {
      // Fall back to mock (console logging)
    }

    return { success: true, message: 'Deletion confirmation sent' };
  } catch (error: any) {
    return { success: false, message: 'Failed to send deletion confirmation' };
  }
};
