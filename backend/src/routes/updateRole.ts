import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

// Update user role (for testing purposes)
router.post('/update-role', verifySupabaseToken, async (req: any, res: any) => {
  try {
    const { role } = req.body;
    const userId = req.user.id;

    if (!['admin', 'super-admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or super-admin' });
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      message: `Role updated to ${role}`,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }
    });
  } catch (error) {
    console.error('Update role error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
