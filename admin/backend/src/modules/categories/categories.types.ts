export interface WasteCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoriesResponse {
  message: string;
  data: WasteCategory[];
}

export interface CategoryDetailResponse {
  message: string;
  data: WasteCategory;
}
