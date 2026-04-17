export interface LoginRequest {
  username: string;
  password: string;
}

export interface AdminPayload {
  username: string;
  role: 'admin';
  loginTime: string;
}

export interface AdminUser {
  username: string;
  role: 'admin';
}

export interface LoginResponse {
  message: string;
  token: string;
  admin: AdminUser;
}
