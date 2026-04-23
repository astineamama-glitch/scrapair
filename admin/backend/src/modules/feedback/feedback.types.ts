/**
 * Feedback Types and Interfaces
 * Admin backend feedback types for TypeScript
 */

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

export interface FeedbackUser {
  id: number;
  email: string;
  type: string;
  businessName?: string;
  companyName?: string;
}

export interface FeedbackCollection {
  id: number;
  status: string;
  requestDate?: string;
  completedAt?: string;
}

export interface FeedbackData {
  id: number;
  collectionId: number;
  fromUserId: number;
  toUserId: number;
  rating: number;
  comment?: string;
  type?: 'positive' | 'negative' | 'neutral';
  createdAt: Date;
  updatedAt: Date;
  fromUser?: FeedbackUser;
  toUser?: FeedbackUser;
  collection?: FeedbackCollection;
}

export interface RatingDistribution {
  '1': number;
  '2': number;
  '3': number;
  '4': number;
  '5': number;
}

export interface TypeBreakdown {
  positive: number;
  negative: number;
  neutral: number;
}

export interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  ratingDistribution: RatingDistribution;
  typeBreakdown: TypeBreakdown;
}

export interface FeedbackResponse {
  message: string;
  data: FeedbackData[];
  pagination: PaginationMeta;
}

export interface FeedbackStatsResponse {
  message: string;
  data: FeedbackStats;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  rating?: number;
  type?: 'positive' | 'negative' | 'neutral';
  fromUserType?: 'business' | 'recycler';
  toUserType?: 'business' | 'recycler';
  startDate?: string;
  endDate?: string;
}
