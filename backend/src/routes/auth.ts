import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  getProfile,
  updateProfile,
  validateRegister,
  validateLogin,
  validateUpdateProfile
} from '../controllers/simpleAuthController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/mockAuth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes - All authenticated users
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

export default router;
