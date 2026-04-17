export interface Material {
  id: number;
  businessUserId: string;
  materialType: string;
  quantity: number;
  unit: string;
  description?: string;
  contactEmail: string;
  status: string;
  isRecommendedForArtists: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaterialRequest {
  businessUserId: string;
  materialType: string;
  quantity: number;
  unit?: string;
  description?: string;
  contactEmail: string;
  status?: string;
  isRecommendedForArtists?: boolean;
}

export interface UpdateMaterialRequest {
  businessUserId?: string;
  materialType?: string;
  quantity?: number;
  unit?: string;
  description?: string;
  contactEmail?: string;
  status?: string;
  isRecommendedForArtists?: boolean;
}

export interface MaterialsResponse {
  message: string;
  count: number;
  data: Material[];
}

export interface MaterialDetailResponse {
  message: string;
  data: Material;
}
