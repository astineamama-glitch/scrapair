import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getAllReports = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const Report = (sequelize as any).models.Report;
    const User = (sequelize as any).models.User;

    const { count, rows } = await Report.findAndCountAll({
      include: [
        {
          model: User,
          as: 'reportedUser',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'email', 'type', 'businessName', 'companyName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'Reports retrieved successfully',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / (limit as number))
      }
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error fetching reports', 
      error: 'Failed to fetch reports',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export { getAllReports };
