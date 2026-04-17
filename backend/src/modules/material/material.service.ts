// Material Service & Model
// Business logic for material management

import CacheService from '../../services/cacheService';

export interface Material {
  id: number;
  businessName?: string;
  materialType: string;
  quantity: number;
  description?: string;
  contactEmail: string;
  createdAt: string;
}

export interface MaterialInput {
  businessName: string;
  materialType: string;
  quantity: number;
  description?: string;
  contactEmail: string;
}

let materialsDatabase: Material[] = [];
let materialId = 1;

const RECOMMENDED_MATERIALS = ['Bronze', 'Copper'];

/**
 * Add a new material to the database
 */
export const addMaterial = (material: MaterialInput): Material => {
  const newMaterial: Material = {
    id: materialId++,
    ...material,
    createdAt: new Date().toISOString()
  };
  materialsDatabase.push(newMaterial);
  return newMaterial;
};

/**
 * Get all materials
 */
export const getAllMaterials = (): Material[] => {
  return materialsDatabase;
};

/**
 * Get recommended materials for artists
 */
export const getRecommendedMaterials = (): Material[] => {
  return materialsDatabase.filter((material) =>
    RECOMMENDED_MATERIALS.includes(material.materialType)
  );
};

/**
 * Get materials by type
 */
export const getMaterialsByType = (materialType: string): Material[] => {
  return materialsDatabase.filter((material) => material.materialType === materialType);
};

/**
 * Get a single material by ID
 */
export const getMaterialById = (id: number): Material | null => {
  return materialsDatabase.find((material) => material.id === id) || null;
};

/**
 * Delete a material by ID
 */
export const deleteMaterial = (id: number): boolean => {
  const index = materialsDatabase.findIndex((material) => material.id === id);
  if (index > -1) {
    materialsDatabase.splice(index, 1);
    return true;
  }
  return false;
};

/**
 * Update a material by ID
 */
export const updateMaterial = (id: number, updates: Partial<MaterialInput>): Material | null => {
  const material = materialsDatabase.find((m) => m.id === id);
  if (material) {
    Object.assign(material, updates);
    return material;
  }
  return null;
};

/**
 * Clear all materials (for testing/reset)
 */
export const clearAllMaterials = (): void => {
  materialsDatabase = [];
  materialId = 1;
};
