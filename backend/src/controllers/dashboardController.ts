import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

// Super Admin Dashboard Overview
export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    // Get comprehensive dashboard data
    const [
      userStats,
      systemStats,
      recentActivity,
      securityAlerts,
      pendingApprovals,
      systemHealth
    ] = await Promise.all([
      getUserStatistics(),
      getSystemStatistics(),
      getRecentActivity(),
      getSecurityAlerts(),
      getPendingApprovals(),
      getSystemHealth()
    ]);

    return res.json({
      overview: {
        totalUsers: userStats.totalUsers,
        activeUsers: userStats.activeUsers,
        bannedUsers: userStats.bannedUsers,
        systemHealth: systemHealth.status,
        pendingApprovals: pendingApprovals.length,
        securityAlerts: securityAlerts.length
      },
      userStats,
      systemStats,
      recentActivity,
      securityAlerts: securityAlerts.slice(0, 5), // Latest 5 alerts
      pendingApprovals: pendingApprovals.slice(0, 5), // Latest 5 approvals
      systemHealth
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// User Statistics
const getUserStatistics = async () => {
  try {
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

    // Role distribution
    const { data: roleData } = await supabaseAdmin
      .from('users')
      .select('role');

    const roleDistribution = roleData?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { count: recentRegistrations } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    return {
      totalUsers,
      activeUsers,
      bannedUsers,
      roleDistribution,
      recentRegistrations
    };
  } catch (error) {
    console.error('Get user statistics error:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      roleDistribution: {},
      recentRegistrations: 0
    };
  }
};

// System Statistics
const getSystemStatistics = async () => {
  try {
    // Database table sizes
    const tables = ['users', 'admin_actions', 'security_logs', 'approval_requests', 'audit_logs'];
    const tableStats: any = {};

    for (const table of tables) {
      const { count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      tableStats[table] = count || 0;
    }

    // System settings
    const { data: systemSettings } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single();

    return {
      tableStats,
      systemSettings: systemSettings || {},
      totalRecords: Object.values(tableStats).reduce((acc: number, count: any) => acc + count, 0)
    };
  } catch (error) {
    console.error('Get system statistics error:', error);
    return {
      tableStats: {},
      systemSettings: {},
      totalRecords: 0
    };
  }
};

// Recent Activity
const getRecentActivity = async () => {
  try {
    const { data: recentActions } = await supabaseAdmin
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return recentActions || [];
  } catch (error) {
    console.error('Get recent activity error:', error);
    return [];
  }
};

// Security Alerts
const getSecurityAlerts = async () => {
  try {
    const { data: alerts } = await supabaseAdmin
      .from('security_logs')
      .select('*')
      .in('severity', ['high', 'critical'])
      .order('created_at', { ascending: false })
      .limit(10);

    return alerts || [];
  } catch (error) {
    console.error('Get security alerts error:', error);
    return [];
  }
};

// Pending Approvals
const getPendingApprovals = async () => {
  try {
    const { data: approvals } = await supabaseAdmin
      .from('approval_requests')
      .select(`
        *,
        requester:requester_id (name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return approvals || [];
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return [];
  }
};

// System Health
const getSystemHealth = async () => {
  try {
    // Check database connectivity
    const { data: healthCheck } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);

    const isDatabaseHealthy = !!healthCheck;

    // Check for recent errors
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { count: recentErrors } = await supabaseAdmin
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .gte('created_at', oneHourAgo.toISOString());

    const errorRate = recentErrors || 0;

    // Determine overall health status
    let status = 'healthy';
    if (errorRate > 10) status = 'critical';
    else if (errorRate > 5) status = 'warning';
    else if (!isDatabaseHealthy) status = 'critical';

    return {
      status,
      database: isDatabaseHealthy ? 'connected' : 'disconnected',
      errorRate,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error('Get system health error:', error);
    return {
      status: 'critical',
      database: 'disconnected',
      errorRate: 0,
      lastChecked: new Date().toISOString()
    };
  }
};

// Quick Actions for Admin Dashboard
export const performQuickAction = async (req: Request, res: Response) => {
  try {
    const { action, targetId, details } = req.body;
    const adminId = (req as any).user.id;

    let result: any = {};

    switch (action) {
      case 'ban_user':
        result = await banUser(targetId, details, adminId);
        break;
      case 'unban_user':
        result = await unbanUser(targetId, adminId);
        break;
      case 'force_logout':
        result = await forceLogoutUser(targetId, adminId);
        break;
      case 'approve_request':
        result = await approveRequest(targetId, details, adminId);
        break;
      case 'reject_request':
        result = await rejectRequest(targetId, details, adminId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.json({ message: 'Action performed successfully', result });
  } catch (error) {
    console.error('Perform quick action error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper functions for quick actions
const banUser = async (userId: string, details: any, adminId: string) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({
      status: 'banned',
      banned_at: new Date().toISOString(),
      ban_reason: details.reason
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id: adminId,
      action_type: 'ban_user',
      target_id: userId,
      details
    });

  return user;
};

const unbanUser = async (userId: string, adminId: string) => {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .update({
      status: 'active',
      banned_at: null,
      ban_reason: null
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id: adminId,
      action_type: 'unban_user',
      target_id: userId,
      details: {}
    });

  return user;
};

const forceLogoutUser = async (userId: string, adminId: string) => {
  const { error } = await supabaseAdmin
    .from('user_sessions')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (error) throw error;

  // Log the action
  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id: adminId,
      action_type: 'force_logout',
      target_id: userId,
      details: {}
    });

  return { message: 'User logged out successfully' };
};

const approveRequest = async (requestId: string, details: any, adminId: string) => {
  const { data: request, error } = await supabaseAdmin
    .from('approval_requests')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approver_id: adminId,
      approval_comments: details.comments
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id: adminId,
      action_type: 'approve_request',
      target_id: requestId,
      details
    });

  return request;
};

const rejectRequest = async (requestId: string, details: any, adminId: string) => {
  const { data: request, error } = await supabaseAdmin
    .from('approval_requests')
    .update({
      status: 'rejected',
      approved_at: new Date().toISOString(),
      approver_id: adminId,
      approval_comments: details.comments
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await supabaseAdmin
    .from('admin_actions')
    .insert({
      admin_id: adminId,
      action_type: 'reject_request',
      target_id: requestId,
      details
    });

  return request;
};
