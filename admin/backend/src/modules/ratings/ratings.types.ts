export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UserRatingData {
  id: string;
  userId: string;
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    type: string;
    businessName?: string;
    companyName?: string;
    isActive: boolean;
  };
}

export interface PostRatingData {
  id: string;
  postId: string;
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRatingsResponse {
  message: string;
  data: UserRatingData[];
  pagination: PaginationMeta;
}

export interface PostRatingsResponse {
  message: string;
  data: PostRatingData[];
  pagination: PaginationMeta;
}
