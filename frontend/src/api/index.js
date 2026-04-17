/**
 * Central API export point
 * Import all API service modules for easy access
 */

// Import service implementations
import authService from './auth/authService';
import userService from './users/userService';
import wastePostService from './wastePosts/wastePostService';
import collectionService from './collections/collectionService';
import messageService from './messages/messageService';
import notificationService from './notifications/notificationService';
import ratingService from './ratings/ratingService';
import feedbackService from './feedback/feedbackService';
import subscriptionService from './subscriptions/subscriptionService';
import reportService from './report/reportService';

// Export individual services
export {
  authService,
  userService,
  wastePostService,
  collectionService,
  messageService,
  notificationService,
  ratingService,
  feedbackService,
  subscriptionService,
  reportService,
};

// Export as default namespace for easier imports
export default {
  authService,
  userService,
  wastePostService,
  collectionService,
  messageService,
  notificationService,
  ratingService,
  feedbackService,
  subscriptionService,
  reportService,
};
