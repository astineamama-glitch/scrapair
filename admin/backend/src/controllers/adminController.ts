import { Request, Response } from 'express';
import { sequelize } from '../shared/db/index';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getStatistics = async (req: Request, res: Response): Promise<any> => {
  try {
    const User = (sequelize as any).models.User;
    const Material = (sequelize as any).models.Material;

    const userCount = User ? await User.count() : 0;
    const materialCount = Material ? await Material.count() : 0;

    res.status(200).json({
      message: 'Statistics retrieved',
      data: {
        totalUsers: userCount,
        totalMaterials: materialCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

export {
  getStatistics
};

