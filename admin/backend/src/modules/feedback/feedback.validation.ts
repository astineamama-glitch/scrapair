/**
 * Feedback Validation
 * Admin backend feedback validation rules
 */

import { FeedbackQuery } from './feedback.types';

export const validatePaginationParams = (page: any, limit: any): { page: number; limit: number } => {
  let pageNum = parseInt(page) || 1;
  let limitNum = parseInt(limit) || 20;

  // Clamp values
  pageNum = Math.max(1, pageNum);
  limitNum = Math.min(100, Math.max(1, limitNum));

  return { page: pageNum, limit: limitNum };
};

export const validateFeedbackFilters = (query: any): FeedbackQuery => {
  const filters: FeedbackQuery = {};

  // Pagination
  if (query.page) filters.page = Math.max(1, parseInt(query.page) || 1);
  if (query.limit) filters.limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));

  // Rating filter (1-5)
  if (query.rating) {
    const rating = parseInt(query.rating);
    if (rating >= 1 && rating <= 5) {
      filters.rating = rating;
    }
  }

  // Type filter
  if (query.type && ['positive', 'negative', 'neutral'].includes(query.type)) {
    filters.type = query.type;
  }

  // User type filters
  if (query.fromUserType && ['business', 'recycler'].includes(query.fromUserType)) {
    filters.fromUserType = query.fromUserType;
  }
  if (query.toUserType && ['business', 'recycler'].includes(query.toUserType)) {
    filters.toUserType = query.toUserType;
  }

  // Date filters
  if (query.startDate) {
    try {
      new Date(query.startDate); // Validate date format
      filters.startDate = query.startDate;
    } catch (e) {
      // Invalid date, skip
    }
  }
  if (query.endDate) {
    try {
      new Date(query.endDate); // Validate date format
      filters.endDate = query.endDate;
    } catch (e) {
      // Invalid date, skip
    }
  }

  return filters;
};

export default {
  validatePaginationParams,
  validateFeedbackFilters
};
