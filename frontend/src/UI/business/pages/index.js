/**
 * Business Pages Index
 * Centralized exports for all business role pages
 */

// Auth Feature
export { default as BusinessLoginPage } from '../AuthFeature/pages/BusinessLoginPage';
export { default as BusinessSignupPage } from '../AuthFeature/pages/BusinessSignupPage';

// Dashboard Feature
export { default as BusinessDashboard } from '../DashboardFeature/pages/BusinessDashboard';

// Waste Post Feature
export { default as MyPostsPage } from '../WastePostFeature/pages/MyPostsPage';
export { default as CreateWastePostPage } from '../WastePostFeature/pages/CreateWastePostPage';
export { default as EditWastePostPage } from '../WastePostFeature/pages/EditWastePostPage';

// Incoming Requests Feature
export { default as ManageCollectionRequestsPage } from '../IncomingRequestsFeature/pages/ManageCollectionRequestsPage';
export { default as PendingApprovalsPage } from '../IncomingRequestsFeature/pages/PendingApprovalsPage';

// Outgoing Requests Feature
export { default as RequestCollectionPage } from '../OutgoingRequestsFeature/pages/RequestCollectionPage';
