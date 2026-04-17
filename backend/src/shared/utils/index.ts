// Shared Utilities - Helper functions used across modules

// Error handling utilities
export const handleError = (error: any, defaultMessage: string = 'An error occurred') => {
  console.error(error);
  return {
    success: false,
    message: error?.message || defaultMessage,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  };
};

// Response formatting utilities
export const formatSuccessResponse = (data: any, message: string = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

export const formatErrorResponse = (message: string, statusCode: number = 400) => {
  return {
    success: false,
    message,
    statusCode
  };
};

// Validation utilities - Add more as needed
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Adjust regex based on your requirements
  const phoneRegex = /^[0-9-+().\s]+$/;
  return phoneRegex.test(phone);
};

// Pagination utilities
export const getPaginationParams = (page: any = 1, limit: any = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  const offset = (pageNum - 1) * limitNum;
  
  return { page: pageNum, limit: limitNum, offset };
};

// Date utilities
export const getDateRange = (days: number = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
};
