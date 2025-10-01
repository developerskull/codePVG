import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import {
  sendAdminInvitation,
  verifyInvitation,
  setupAdminProfile,
  getAdminInvitations,
  cancelInvitation
} from '../controllers/adminInvitationController';

const router = Router();

// Middleware to check if user is admin or super-admin
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = req.user;
    if (!user || !['admin', 'super-admin'].includes(user.role)) {
      return res.status(403).json({ 
        error: 'Admin access required',
        currentRole: user?.role || 'none',
        requiredRoles: ['admin', 'super-admin']
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Public routes (no authentication required)
router.get('/verify-invitation', verifyInvitation);
router.post('/setup-profile', setupAdminProfile);

// Protected routes (admin or super-admin)
router.use(verifySupabaseToken);
router.use(requireAdmin);

router.post('/invite', sendAdminInvitation);
router.get('/invitations', getAdminInvitations);
router.delete('/invitations/:id', cancelInvitation);

export default router;
