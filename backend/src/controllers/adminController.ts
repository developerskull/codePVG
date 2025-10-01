import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

// User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }
    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: users, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, username, role, status, bio, github_link, linkedin_url } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        name,
        email,
        username,
        role,
        status,
        bio,
        github_link,
        linkedin_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, duration } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        status: 'banned',
        banned_at: new Date().toISOString(),
        ban_reason: reason,
        ban_duration: duration
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the ban action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'ban_user',
        target_id: id,
        details: { reason, duration },
        ip_address: req.ip
      });

    return res.json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Ban user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const unbanUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        status: 'active',
        banned_at: null,
        ban_reason: null,
        ban_duration: null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the unban action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'unban_user',
        target_id: id,
        details: {},
        ip_address: req.ip
      });

    return res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Unban user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Data Management
export const getSystemStats = async (req: Request, res: Response) => {
  try {
    // Get user statistics
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: bannedUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'banned');

    // Get role distribution
    const { data: roleStats } = await supabaseAdmin
      .from('users')
      .select('role')
      .not('role', 'is', null);

    const roleDistribution = roleStats?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Get recent activity
    const { data: recentActivity } = await supabaseAdmin
      .from('admin_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        banned: bannedUsers
      },
      roleDistribution,
      recentActivity
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportUserData = async (req: Request, res: Response) => {
  try {
    const { format = 'json', role = '', status = '' } = req.query;

    let query = supabaseAdmin
      .from('users')
      .select('*');

    if (role) {
      query = query.eq('role', role);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = [
        'ID,Name,Email,Username,Role,Status,Created At',
        ...users.map(user => 
          `${user.id},${user.name},${user.email},${user.username || ''},${user.role},${user.status},${user.created_at}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      return res.send(csv);
    }

    return res.json(users);
  } catch (error) {
    console.error('Export user data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// System Settings
export const getSystemSettings = async (req: Request, res: Response) => {
  try {
    const { data: settings, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    return res.json(settings || {});
  } catch (error) {
    console.error('Get system settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSystemSettings = async (req: Request, res: Response) => {
  try {
    const settings = req.body;

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString(),
        updated_by: (req as any).user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the settings update
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'update_system_settings',
        target_id: null,
        details: settings,
        ip_address: req.ip
      });

    return res.json({ message: 'System settings updated successfully', settings: data });
  } catch (error) {
    console.error('Update system settings error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Analytics
export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // User registration analytics
    const { data: userRegistrations } = await supabaseAdmin
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString());

    // Daily registration counts
    const dailyRegistrations = userRegistrations?.reduce((acc: any, user: any) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Role distribution over time
    const { data: roleData } = await supabaseAdmin
      .from('users')
      .select('role, created_at')
      .gte('created_at', startDate.toISOString());

    const roleOverTime = roleData?.reduce((acc: any, user: any) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = {};
      acc[date][user.role] = (acc[date][user.role] || 0) + 1;
      return acc;
    }, {});

    // Admin actions analytics
    const { data: adminActions } = await supabaseAdmin
      .from('admin_actions')
      .select('action_type, created_at')
      .gte('created_at', startDate.toISOString());

    const actionCounts = adminActions?.reduce((acc: any, action: any) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      period,
      userRegistrations: dailyRegistrations,
      roleOverTime,
      actionCounts,
      totalUsers: userRegistrations?.length || 0
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Security Dashboard
export const getSecurityLogs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, type = '', severity = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('security_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }
    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: logs, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get security logs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdminActions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, admin_id = '', action_type = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (admin_id) {
      query = query.eq('admin_id', admin_id);
    }
    if (action_type) {
      query = query.eq('action_type', action_type);
    }

    const { data: actions, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      actions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get admin actions error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Database Management
export const getDatabaseStats = async (req: Request, res: Response) => {
  try {
    // Get table sizes and row counts
    const tables = ['users', 'admin_actions', 'security_logs', 'system_settings'];
    const stats: any = {};

    for (const table of tables) {
      const { count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      stats[table] = count || 0;
    }

    return res.json({
      tableStats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get database stats error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const cleanupOldData = async (req: Request, res: Response) => {
  try {
    const { days = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Clean up old security logs
    const { error: securityError } = await supabaseAdmin
      .from('security_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (securityError) {
      return res.status(400).json({ error: securityError.message });
    }

    // Clean up old admin actions (keep for audit)
    // const { error: actionsError } = await supabaseAdmin
    //   .from('admin_actions')
    //   .delete()
    //   .lt('created_at', cutoffDate.toISOString());

    return res.json({ 
      message: `Cleaned up data older than ${days} days`,
      cutoffDate: cutoffDate.toISOString()
    });
  } catch (error) {
    console.error('Cleanup old data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Approval System
export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const { data: approvals, error } = await supabaseAdmin
      .from('approval_requests')
      .select(`
        *,
        requester:requester_id (name, email),
        approver:approver_id (name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(approvals);
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comments = '' } = req.body;

    const { data: approval, error } = await supabaseAdmin
      .from('approval_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approver_id: (req as any).user.id,
        approval_comments: comments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the approval action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'approve_request',
        target_id: id,
        details: { comments },
        ip_address: req.ip
      });

    return res.json({ message: 'Request approved successfully', approval });
  } catch (error) {
    console.error('Approve request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { comments = '' } = req.body;

    const { data: approval, error } = await supabaseAdmin
      .from('approval_requests')
      .update({
        status: 'rejected',
        approved_at: new Date().toISOString(),
        approver_id: (req as any).user.id,
        approval_comments: comments
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the rejection action
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'reject_request',
        target_id: id,
        details: { comments },
        ip_address: req.ip
      });

    return res.json({ message: 'Request rejected successfully', approval });
  } catch (error) {
    console.error('Reject request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
