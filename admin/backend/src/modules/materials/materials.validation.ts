import { CreateMaterialRequest, UpdateMaterialRequest } from './materials.types';

export const validateCreateMaterial = (body: any): boolean => {
  return !!(body.businessUserId && body.materialType && body.quantity && body.contactEmail);
};

export const validateUpdateMaterial = (body: any): boolean => {
  // At least one field should be present for update
  return !!(body.businessUserId || body.materialType || body.quantity || body.contactEmail || body.status);
};
