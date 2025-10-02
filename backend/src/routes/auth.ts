import { Router } from 'express';
import { 
  login, 
  signup, 
  validateLogin, 
  validateSignup, 
  getProfile, 
  updateProfile, 
  verifySupabaseToken 
} from '../controllers/supabaseAuthController';

const router = Router();

// Public routes - Using Supabase Authentication
router.post('/signup', validateSignup, signup);
router.post('/register', validateSignup, signup); // Alias for signup
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', verifySupabaseToken, getProfile);
router.put('/profile', verifySupabaseToken, updateProfile);

export default router;
