import apiClient from './api';

const reportService = {
  // Get user's own submitted reports
  getMyReports: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/reports/my-reports', {
        params: { page, limit }
      });
      // Backend returns: { message, data: [...reports], pagination: {...} }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch your reports';
      throw new Error(msg);
    }
  },

  // Submit a new report against a user
  submitReport: async (reportData) => {
    try {
      const payload = {
        reportedUserId: reportData.reportedUserId,
        reason: reportData.reason,
        description: reportData.description,
        ...(reportData.collectionId && { collectionId: reportData.collectionId }),
        ...(reportData.postId && { postId: reportData.postId })
      };
      const response = await apiClient.post('/reports', payload);
      // Backend returns: { message, data: { id, status, validityScore, validationReason } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to submit report';
      throw new Error(msg);
    }
  },

  // Admin: Get pending reports
  getPendingReports: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/reports/admin/pending', {
        params: { page, limit }
      });
      // Backend returns: { message, data: [...reports], pagination: {...} }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch pending reports';
      throw new Error(msg);
    }
  },

  // Admin: Get all reports
  getAllReports: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get('/reports/admin/all', {
        params: { page, limit }
      });
      // Backend returns: { message, data: [...reports], pagination: {...} }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to fetch reports';
      throw new Error(msg);
    }
  },

  // Admin: Approve a report
  approveReport: async (reportId, approvalData = {}) => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/approve`, approvalData);
      // Backend returns: { message, data: { report, pointsDeducted } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to approve report';
      throw new Error(msg);
    }
  },

  // Admin: Reject a report
  rejectReport: async (reportId, rejectionReason = '') => {
    try {
      const response = await apiClient.put(`/reports/${reportId}/reject`, { rejectionReason });
      // Backend returns: { message, data: { report } }
      return response.data?.data || response.data || response;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to reject report';
      throw new Error(msg);
    }
  }
};

export default reportService;
