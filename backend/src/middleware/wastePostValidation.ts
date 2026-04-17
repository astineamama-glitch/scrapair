import { Request, Response, NextFunction } from 'express';

export const validateCreateWastePost = (req: Request, res: Response, next: NextFunction): any => {
  const { title, description, wasteType, quantity, unit, condition, location, latitude, longitude, city, address } = req.body;

  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('Title is required and must be a non-empty string');
  } else if (title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  } else if (description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }

  if (!wasteType || typeof wasteType !== 'string' || wasteType.trim().length === 0) {
    errors.push('Waste type is required and must be a non-empty string');
  }

  if (!quantity || isNaN(parseFloat(quantity))) {
    errors.push('Quantity is required and must be a valid number');
  } else if (parseFloat(quantity) <= 0) {
    errors.push('Quantity must be greater than 0');
  }

  if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
    errors.push('Unit is required and must be a non-empty string');
  }

  const validConditions = ['poor', 'fair', 'good', 'excellent'];
  if (!condition || !validConditions.includes(condition)) {
    errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
  }

  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.push('Location is required and must be a non-empty string');
  }

  if (latitude === undefined || latitude === null || isNaN(parseFloat(latitude))) {
    errors.push('Latitude is required and must be a valid number');
  } else if (parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (longitude === undefined || longitude === null || isNaN(parseFloat(longitude))) {
    errors.push('Longitude is required and must be a valid number');
  } else if (parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  if (!city || typeof city !== 'string' || city.trim().length === 0) {
    errors.push('City is required and must be a non-empty string');
  }

  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    errors.push('Address is required and must be a non-empty string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateUpdateWastePost = (req: Request, res: Response, next: NextFunction): any => {
  const { title, description, wasteType, quantity, unit, condition, location, latitude, longitude, city, address, status, visibility } = req.body;

  const errors: string[] = [];

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    errors.push('Title must be a non-empty string');
  }
  if (title && title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    errors.push('Description must be a non-empty string');
  }
  if (description && description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }

  if (quantity !== undefined && (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0)) {
    errors.push('Quantity must be a positive number');
  }

  if (unit !== undefined && (typeof unit !== 'string' || unit.trim().length === 0)) {
    errors.push('Unit must be a non-empty string');
  }

  if (condition !== undefined) {
    const validConditions = ['poor', 'fair', 'good', 'excellent'];
    if (!validConditions.includes(condition)) {
      errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
    }
  }

  if (status !== undefined) {
    const validStatuses = ['draft', 'active', 'reserved', 'collected'];
    if (!validStatuses.includes(status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
  }

  if (visibility !== undefined) {
    const validVisibility = ['private', 'public'];
    if (!validVisibility.includes(visibility)) {
      errors.push(`Visibility must be one of: ${validVisibility.join(', ')}`);
    }
  }

  if (latitude !== undefined) {
    if (isNaN(parseFloat(latitude)) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
  }

  if (longitude !== undefined) {
    if (isNaN(parseFloat(longitude)) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
      errors.push('Longitude must be between -180 and 180');
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

export const validateSearchFilters = (req: Request, res: Response, next: NextFunction): any => {
  const { q, latitude, longitude, distance, page, limit, sort, type, condition } = req.query;

  const errors: string[] = [];

  if (page !== undefined) {
    const pageNum = parseInt(page as string);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit as string);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }

  if (latitude !== undefined) {
    const lat = parseFloat(latitude as string);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be a valid number between -90 and 90');
    }
  }

  if (longitude !== undefined) {
    const lng = parseFloat(longitude as string);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be a valid number between -180 and 180');
    }
  }

  if (distance !== undefined) {
    const dist = parseInt(distance as string);
    if (isNaN(dist) || dist < 1) {
      errors.push('Distance must be a positive integer');
    }
  }

  if (sort !== undefined) {
    const validSorts = ['newest', 'oldest'];
    if (!validSorts.includes(sort as string)) {
      errors.push(`Sort must be one of: ${validSorts.join(', ')}`);
    }
  }

  if (condition !== undefined) {
    const validConditions = ['poor', 'fair', 'good', 'excellent'];
    if (!validConditions.includes(condition as string)) {
      errors.push(`Condition must be one of: ${validConditions.join(', ')}`);
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
