import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  getProfile,
  validateRegister,
  validateLogin
} from '../controllers/simpleAuthController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/mockAuth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes - All authenticated users
router.get('/profile', authenticateToken, getProfile);

export default router;
