export const validateCreateCategory = (body: any): boolean => {
  return !!(body.name && typeof body.name === 'string' && body.name.trim().length > 0);
};

export const validateUpdateCategory = (body: any): boolean => {
  // At least one field should be present for update
  return !!(body.name || body.description !== undefined || body.icon !== undefined || body.isActive !== undefined);
};
