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

export interface SystemLogData {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
  details?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SystemLogsResponse {
  message: string;
  data: SystemLogData[];
  pagination: PaginationMeta;
}

export interface ClearLogsResponse {
  message: string;
  deletedCount: number;
}
