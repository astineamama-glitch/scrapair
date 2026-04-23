/**
 * Feedback Module Index
 * Exports for admin backend feedback module
 */

export { getAllFeedback, getFeedbackStats } from './feedback.controller';
export { validatePaginationParams, validateFeedbackFilters } from './feedback.validation';
export type {
  PaginationParams,
  PaginationMeta,
  FeedbackData,
  FeedbackUser,
  FeedbackCollection,
  FeedbackStats,
  FeedbackResponse,
  FeedbackStatsResponse,
  FeedbackQuery,
  RatingDistribution,
  TypeBreakdown
} from './feedback.types';
export { default as feedbackRoutes } from './feedback.routes';
