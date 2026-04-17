interface AdminMaterial {
  id: number;
  businessName?: string;
  materialType: string;
  quantity: string;
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

interface MaterialUpdate {
  [key: string]: any;
}

interface Statistics {
  totalMaterials: number;
  totalBusinesses: number;
  materialTypes: Record<string, number>;
  lastUpdated: string;
}

let materialsDatabase: AdminMaterial[] = [];
let materialId = 1;

const initializeDatabase = (): void => {
  materialsDatabase = [
    {
      id: materialId++,
      businessName: 'ABC Metals Inc',
      materialType: 'Metals',
      quantity: '500 kg',
      description: 'Scrap metal from industrial manufacturing',
      contactEmail: 'contact@abcmetals.com',
      createdAt: new Date().toISOString()
    },
    {
      id: materialId++,
      businessName: 'Bronze Works Ltd',
      materialType: 'Bronze',
      quantity: '100 kg',
      description: 'Recycled bronze sheets',
      contactEmail: 'info@bronzeworks.com',
      createdAt: new Date().toISOString()
    }
  ];
};

initializeDatabase();
const getAllMaterials = (): AdminMaterial[] => {
  return materialsDatabase;
};
const getMaterialById = (id: number): AdminMaterial | null => {
  return materialsDatabase.find((m) => m.id === id) || null;
};
const createMaterial = (material: MaterialInput): AdminMaterial => {
  const newMaterial: AdminMaterial = {
    id: materialId++,
    ...material,
    quantity: material.quantity.toString(),
    createdAt: new Date().toISOString()
  };
  materialsDatabase.push(newMaterial);
  return newMaterial;
};
const updateMaterial = (id: number, updates: MaterialUpdate): AdminMaterial | null => {
  const index = materialsDatabase.findIndex((m) => m.id === id);
  if (index > -1) {
    materialsDatabase[index] = { ...materialsDatabase[index], ...updates };
    return materialsDatabase[index];
  }
  return null;
};
const deleteMaterial = (id: number): AdminMaterial | null => {
  const index = materialsDatabase.findIndex((m) => m.id === id);
  if (index > -1) {
    const deleted = materialsDatabase.splice(index, 1);
    return deleted[0];
  }
  return null;
};
const getStatistics = (): Statistics => {
  const materialTypes: Record<string, number> = {};
  materialsDatabase.forEach((m) => {
    materialTypes[m.materialType] = (materialTypes[m.materialType] || 0) + 1;
  });

  return {
    totalMaterials: materialsDatabase.length,
    totalBusinesses: new Set(materialsDatabase.map((m) => m.businessName)).size,
    materialTypes: materialTypes,
    lastUpdated: new Date().toISOString()
  };
};

export { getAllMaterials, getMaterialById, createMaterial, updateMaterial, deleteMaterial, getStatistics };
export type { AdminMaterial, MaterialInput, MaterialUpdate, Statistics };
