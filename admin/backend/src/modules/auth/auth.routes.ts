import express from 'express';
import { login } from './auth.controller';

const router = express.Router();

// Login endpoint - no authentication required to access this
router.post('/login', login);

export default router;
