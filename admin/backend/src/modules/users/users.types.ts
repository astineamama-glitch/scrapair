export interface User {
  id: number;
  email: string;
  type: 'business' | 'recycler';
  businessName?: string;
  companyName?: string;
  phone: string;
  specialization?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MappedUser {
  id: number;
  email: string;
  type: 'business' | 'recycler';
  name: string;
  phone: string;
  specialization?: string | null;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  businessName?: string;
  companyName?: string;
}

export interface GetUsersQuery {
  type?: string;
  verified?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface UsersResponse {
  message: string;
  users: MappedUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface UserDetailResponse {
  message: string;
  user: MappedUser;
}

export interface VerificationUpdateRequest {
  isVerified: boolean;
}
