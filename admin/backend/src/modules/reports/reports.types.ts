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

export interface ReportUser {
  id: string;
  email: string;
  type: string;
  businessName?: string;
  companyName?: string;
}

export interface ReportData {
  id: string;
  content: string;
  reason: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  reportedUser?: ReportUser;
  reporter?: ReportUser;
}

export interface ReportsResponse {
  message: string;
  data: ReportData[];
  pagination: PaginationMeta;
}
