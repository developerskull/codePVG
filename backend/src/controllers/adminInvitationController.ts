import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logAdminAction } from '../utils/adminSchema';

// Send admin invitation
export const sendAdminInvitation = async (req: Request, res: Response) => {
  try {
    const { email, role, message } = req.body;
    const adminId = (req as any).user.id;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ 
        error: 'User with this email already exists',
        existingRole: existingUser.role 
      });
    }

    // Generate invitation token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Try to create invitation, handle table not existing
    let invitation;
    try {
      const { data: invitationData, error } = await supabaseAdmin
        .from('admin_invitations')
        .insert({
          email,
          role,
          token,
          message: message || `You have been invited to become an ${role} on CollegeCodeHub.`,
          invited_by: adminId,
          expires_at: expiresAt.toISOString(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('relation "admin_invitations" does not exist')) {
          return res.status(500).json({ 
            error: 'Admin invitations table not found. Please create the table first.',
            sql: `
              CREATE TABLE admin_invitations (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                message TEXT,
                invited_by UUID NOT NULL REFERENCES users(id),
                user_id UUID REFERENCES users(id),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                accepted_at TIMESTAMP WITH TIME ZONE,
                cancelled_at TIMESTAMP WITH TIME ZONE,
                cancelled_by UUID REFERENCES users(id)
              );
            `
          });
        }
        return res.status(400).json({ error: error.message });
      }

      invitation = invitationData;
    } catch (tableError) {
      return res.status(500).json({ 
        error: 'Database table error. Please ensure admin_invitations table exists.',
        details: tableError
      });
    }

    // Log the invitation action (if logAdminAction exists)
    try {
      await logAdminAction(
        adminId,
        'send_admin_invitation',
        invitation.id,
        { email, role },
        req.ip,
        req.get('User-Agent')
      );
    } catch (logError) {
      console.warn('Could not log admin action:', logError);
    }

    // TODO: Send email notification
    // This would integrate with an email service like SendGrid, AWS SES, etc.
    console.log(`Admin invitation sent to ${email} with token: ${token}`);
    console.log(`Setup URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${token}`);

    return res.json({
      message: 'Admin invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at
      }
    });
  } catch (error) {
    console.error('Send admin invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify invitation token
export const verifyInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Invitation token is required' });
    }

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
      expires_at: invitation.expires_at,
      invited_by: invitation.invited_by
    });
  } catch (error) {
    console.error('Verify invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Setup admin profile
export const setupAdminProfile = async (req: Request, res: Response) => {
  try {
    const { token, name, department, password } = req.body;

    if (!token || !name || !department || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Verify invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('admin_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Create user account
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUser.user.id,
        name,
        email: invitation.email,
        role: invitation.role,
        department,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      // If user creation fails, delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ error: userError.message });
    }

    // Update invitation status
    await supabaseAdmin
      .from('admin_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user_id: user.id
      })
      .eq('id', invitation.id);

    // Log the profile creation
    await logAdminAction(
      user.id,
      'create_admin_profile',
      user.id,
      { name, department, role: invitation.role },
      req.ip,
      req.get('User-Agent')
    );

    return res.json({
      message: 'Admin profile created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Setup admin profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Get admin invitations
export const getAdminInvitations = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('admin_invitations')
      .select(`
        *,
        inviter:invited_by (name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: invitations, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      invitations,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get admin invitations error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Cancel invitation
export const cancelInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user.id;

    const { data: invitation, error } = await supabaseAdmin
      .from('admin_invitations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: adminId
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the cancellation
    await logAdminAction(
      adminId,
      'cancel_admin_invitation',
      id,
      { email: invitation.email },
      req.ip,
      req.get('User-Agent')
    );

    return res.json({ message: 'Invitation cancelled successfully' });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
