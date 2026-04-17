/**
 * Common Pages Index
 * Centralized exports for all cross-role pages
 */

// Auth Feature
export { default as LandingPage } from '../AuthFeature/pages/LandingPage';
export { default as RoleSelectionPage } from '../AuthFeature/pages/RoleSelectionPage';

// Account Feature
export { default as EmailVerificationPage } from '../AccountFeature/pages/EmailVerificationPage';
export { default as ForgotPasswordPage } from '../AccountFeature/pages/ForgotPasswordPage';
export { default as ResetPasswordPage } from '../AccountFeature/pages/ResetPasswordPage';
export { default as EditProfilePage } from '../AccountFeature/pages/EditProfilePage';

// Communication Feature
export { default as ConversationPage } from '../CommunicationFeature/pages/ConversationPage';
export { default as MessagesPage } from '../CommunicationFeature/pages/MessagesPage';
export { default as NotificationsPage } from '../CommunicationFeature/pages/NotificationsPage';

// Content View Feature
export { default as WastePostDetailsPage } from '../ContentViewFeature/pages/WastePostDetailsPage';
export { default as CollectionDetailPage } from '../ContentViewFeature/pages/CollectionDetailPage';

// System Feature
export { default as UserReportsPage } from '../SystemFeature/pages/UserReportsPage';
