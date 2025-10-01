import { Router } from 'express';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

// Test endpoint to create admin invitation without authentication
router.post('/test-invite', async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Generate invitation token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // First, get a real user ID from the database
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    if (userError || !users || users.length === 0) {
      return res.status(400).json({ error: 'No users found in database' });
    }

    // Create invitation
    const { data: invitation, error } = await supabaseAdmin
      .from('admin_invitations')
      .insert({
        email,
        role,
        token,
        message: `You have been invited to become an ${role} on CollegeCodeHub.`,
        invited_by: users[0].id, // Use real user ID
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    console.log(`Test admin invitation created for ${email} with token: ${token}`);
    console.log(`Setup URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${token}`);

    return res.json({
      message: 'Test admin invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
        expires_at: invitation.expires_at,
        setup_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${token}`
      }
    });
  } catch (error) {
    console.error('Test admin invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to verify invitation
router.get('/test-verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { data: invitation, error } = await supabaseAdmin
      .from('admin_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    return res.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expires_at: invitation.expires_at
    });
  } catch (error) {
    console.error('Test verify invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
