import { LoginRequest } from './auth.types';

const validateLoginRequest = (body: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!body.username || typeof body.username !== 'string') {
    errors.push('Username is required and must be a string');
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push('Password is required and must be a string');
  }

  if (body.username && body.username.length < 1) {
    errors.push('Username cannot be empty');
  }

  if (body.password && body.password.length < 1) {
    errors.push('Password cannot be empty');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export { validateLoginRequest };
