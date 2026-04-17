import { Request, Response, NextFunction } from 'express';

export const validateCollectionRequest = (req: Request, res: Response, next: NextFunction): any => {
  const { postId } = req.body;
  const errors: string[] = [];

  if (!postId || typeof postId !== 'number' || postId <= 0) {
    errors.push('Post ID is required and must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};
export const validateScheduleCollection = (req: Request, res: Response, next: NextFunction): any => {
  const { scheduledDate } = req.body;
  const errors: string[] = [];

  if (!scheduledDate) {
    errors.push('Scheduled date is required');
  } else {
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      errors.push('Scheduled date must be a valid date');
    } else if (date <= new Date()) {
      errors.push('Scheduled date must be in the future');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};
export const validateCollectionQuery = (req: Request, res: Response, next: NextFunction): any => {
  const { page, limit, wasteType, city, status } = req.query;
  const errors: string[] = [];

  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive number');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }

  if (status !== undefined) {
    const validStatuses = ['pending', 'approved', 'scheduled', 'completed', 'confirmed'];
    if (!validStatuses.includes(status as string)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};
