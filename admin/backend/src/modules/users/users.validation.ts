import { GetUsersQuery, VerificationUpdateRequest } from './users.types';

export const validateGetUsersQuery = (query: any): GetUsersQuery => {
  return {
    type: query.type || undefined,
    verified: query.verified || undefined,
    page: query.page ? parseInt(query.page) : 1,
    limit: query.limit ? parseInt(query.limit) : 10,
    search: query.search || ''
  };
};

export const validateVerificationUpdate = (body: any): boolean => {
  return typeof body.isVerified === 'boolean';
};
