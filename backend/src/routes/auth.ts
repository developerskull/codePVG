import { Router } from 'express';
import passport from 'passport';
import {
  register,
  login,
  getProfile,
  updateProfile,
  updateUser,
  getAllUsers,
  deleteUser,
  linkedinCallback,
  getPendingApprovals,
  updateApprovalStatus,
  getColleges,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateUpdateUser
} from '../controllers/authController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// LinkedIn OAuth routes - only if credentials are configured
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  router.get('/linkedin', passport.authenticate('linkedin', { state: 'SOME_STATE' }));
  router.get(
    '/linkedin/callback',
    passport.authenticate('linkedin', { failureRedirect: '/auth/login', session: false }),
    linkedinCallback
  );
} else {
  // Fallback routes when LinkedIn is not configured
  router.get('/linkedin', (req, res) => {
    res.status(503).json({ error: 'LinkedIn OAuth is not configured. Please contact the administrator.' });
  });
  router.get('/linkedin/callback', (req, res) => {
    res.status(503).json({ error: 'LinkedIn OAuth is not configured. Please contact the administrator.' });
  });
}

// College routes
router.get('/colleges', getColleges);

// Protected routes - All authenticated users
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

// Admin & Super-admin routes - User management
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/users/:id', authenticateToken, requireAdmin, validateUpdateUser, updateUser);

// Admin approval routes
router.get('/approvals/pending', authenticateToken, requireAdmin, getPendingApprovals);
router.put('/approvals/:id', authenticateToken, requireAdmin, updateApprovalStatus);

// Super-admin only routes
router.delete('/users/:id', authenticateToken, requireSuperAdmin, deleteUser);

export default router;
