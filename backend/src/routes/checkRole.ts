import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';

const router = Router();

// Check current user role
router.get('/check-role', verifySupabaseToken, async (req: any, res: any) => {
  try {
    const user = req.user;
    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: `Current user role: ${user.role}`,
      canSendInvitations: user.role === 'super-admin'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to check role' });
  }
});

export default router;
