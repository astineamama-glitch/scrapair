// Shared Types - Common interfaces used across modules

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserPayload {
  id: number;
  email: string;
  businessName?: string;
  companyName?: string;
  type: 'business' | 'recycler';
  role?: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: UserPayload;
  token?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
}

export enum UserRole {
  USER = 'user',
  BUSINESS = 'business',
  RECYCLER = 'recycler',
  ADMIN = 'admin'
}

export enum NotificationType {
  COLLECTION_REQUEST = 'collection_request',
  MESSAGE = 'message',
  RATING = 'rating',
  REVIEW = 'review',
  REPORT = 'report',
  SYSTEM = 'system'
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}
