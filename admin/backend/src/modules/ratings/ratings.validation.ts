import { PaginationParams } from './ratings.types';

const validatePaginationParams = (queryParams: any): PaginationParams => {
  let page = parseInt(queryParams.page as string) || 1;
  let limit = parseInt(queryParams.limit as string) || 20;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // Cap at 100 items per page

  return { page, limit };
};

export { validatePaginationParams };
