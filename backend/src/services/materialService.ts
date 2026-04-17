interface Material {
  id: number;
  businessName?: string;
  materialType: string;
  quantity: number;
  description?: string;
  contactEmail: string;
  createdAt: string;
}

interface MaterialInput {
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
 * @param {MaterialInput} material - Material object
 * @returns {Material} - Created material with ID and timestamp
 */
const addMaterial = (material: MaterialInput): Material => {
  const newMaterial: Material = {
    id: materialId++,
    ...material,
    createdAt: new Date().toISOString()
  };
  materialsDatabase.push(newMaterial);
  return newMaterial;
};

/**
 * Get all materials in the database
 * @returns {Material[]} - All materials
 */
const getAllMaterials = (): Material[] => {
  return materialsDatabase;
};

/**
 * Get recommended materials for artists based on specific material types
 * @returns {Material[]} - Materials that match artist-recommended types (Bronze, Copper)
 */
const getRecommendedMaterials = (): Material[] => {
  return materialsDatabase.filter((material) =>
    RECOMMENDED_MATERIALS.includes(material.materialType)
  );
};

/**
 * Get materials by type
 * @param {string} materialType - The type of material to filter by
 * @returns {Material[]} - Materials matching the type
 */
const getMaterialsByType = (materialType: string): Material[] => {
  return materialsDatabase.filter((material) => material.materialType === materialType);
};

/**
 * Get a single material by ID
 * @param {number} id - Material ID
 * @returns {Material|null} - Material object or null if not found
 */
const getMaterialById = (id: number): Material | null => {
  return materialsDatabase.find((material) => material.id === id) || null;
};

/**
 * Delete a material by ID
 * @param {number} id - Material ID
 * @returns {boolean} - True if deleted, false if not found
 */
const deleteMaterial = (id: number): boolean => {
  const index = materialsDatabase.findIndex((material) => material.id === id);
  if (index > -1) {
    materialsDatabase.splice(index, 1);
    return true;
  }
  return false;
};

export {
  addMaterial,
  getAllMaterials,
  getRecommendedMaterials,
  getMaterialsByType,
  getMaterialById,
  deleteMaterial
};
export type { Material, MaterialInput };
