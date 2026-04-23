import { Request, Response } from 'express';
import { verifyCredentials, generateToken } from '../../shared/config/jwt';
import { logAdminLogin } from '../../shared/utils/auditLogger';
import { AdminUser } from '../../models';

const NODE_ENV = process.env.NODE_ENV || 'development';

const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    if (!verifyCredentials(username, password)) {
      return res.status(401).json({
        error: 'Invalid username or password'
      });
    }

    // Get the admin user ID from the database
    const adminUser = await AdminUser.findOne({ where: { username: username } });
    if (!adminUser) {
      return res.status(401).json({
        error: 'Admin user not found'
      });
    }

    const token = generateToken({
      id: adminUser.id,
      username: username,
      role: 'admin',
      loginTime: new Date().toISOString()
    });

    // Log admin login
    await logAdminLogin(username, req);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      admin: {
        username: username,
        role: 'admin'
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Login failed',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export { login };
