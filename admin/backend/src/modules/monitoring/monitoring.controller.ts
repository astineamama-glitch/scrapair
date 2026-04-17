import { Request, Response } from 'express';
import { sequelize } from '../../shared/db/index';

const NODE_ENV = process.env.NODE_ENV || 'development';

const getSystemLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = ((page as number) - 1) * (limit as number);

    const SystemLog = (sequelize as any).models.SystemLog;

    const { count, rows } = await SystemLog.findAndCountAll({
      order: [['timestamp', 'DESC']],
      limit: limit as number,
      offset
    });

    res.status(200).json({
      message: 'System logs retrieved successfully',
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
      message: 'Error fetching system logs', 
      error: 'Failed to fetch system logs',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

const clearSystemLogs = async (req: Request, res: Response): Promise<any> => {
  try {
    const SystemLog = (sequelize as any).models.SystemLog;
    
    const deletedCount = await SystemLog.destroy({
      where: {},
      truncate: true
    });

    res.status(200).json({
      message: 'All system logs cleared successfully',
      deletedCount
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error clearing system logs', 
      error: 'Failed to clear system logs',
      ...(NODE_ENV === 'development' && { details: error.message })
    });
  }
};

export { getSystemLogs, clearSystemLogs };
