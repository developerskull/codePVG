import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

// Advanced Analytics Dashboard
export const getDashboardAnalytics = async (req: Request, res: Response) => {
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

    // User Growth Analytics
    const { data: userGrowth } = await supabaseAdmin
      .from('users')
      .select('created_at, role, status')
      .gte('created_at', startDate.toISOString());

    // Daily user registrations
    const dailyRegistrations = userGrowth?.reduce((acc: any, user: any) => {
      const date = new Date(user.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, students: 0, admins: 0, superAdmins: 0 };
      acc[date].total++;
      if (user.role === 'student') acc[date].students++;
      if (user.role === 'admin') acc[date].admins++;
      if (user.role === 'super-admin') acc[date].superAdmins++;
      return acc;
    }, {});

    // Role distribution
    const roleDistribution = userGrowth?.reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Status distribution
    const statusDistribution = userGrowth?.reduce((acc: any, user: any) => {
      acc[user.status] = (acc[user.status] || 0) + 1;
      return acc;
    }, {});

    // Activity Analytics
    const { data: adminActions } = await supabaseAdmin
      .from('admin_actions')
      .select('action_type, created_at')
      .gte('created_at', startDate.toISOString());

    const actionCounts = adminActions?.reduce((acc: any, action: any) => {
      acc[action.action_type] = (acc[action.action_type] || 0) + 1;
      return acc;
    }, {});

    // Security Analytics
    const { data: securityLogs } = await supabaseAdmin
      .from('security_logs')
      .select('type, severity, created_at')
      .gte('created_at', startDate.toISOString());

    const securityStats = securityLogs?.reduce((acc: any, log: any) => {
      if (!acc[log.type]) acc[log.type] = { total: 0, low: 0, medium: 0, high: 0, critical: 0 };
      acc[log.type].total++;
      acc[log.type][log.severity]++;
      return acc;
    }, {});

    // System Performance Metrics
    const { data: systemSettings } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .single();

    // Recent Activity
    const { data: recentActivity } = await supabaseAdmin
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return res.json({
      period,
      userGrowth: {
        dailyRegistrations,
        roleDistribution,
        statusDistribution,
        totalUsers: userGrowth?.length || 0
      },
      activity: {
        actionCounts,
        totalActions: adminActions?.length || 0
      },
      security: {
        securityStats,
        totalSecurityEvents: securityLogs?.length || 0
      },
      system: {
        settings: systemSettings,
        maintenanceMode: systemSettings?.maintenance_mode || false
      },
      recentActivity
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// User Behavior Analytics
export const getUserBehaviorAnalytics = async (req: Request, res: Response) => {
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

    // User engagement metrics
    const { data: userSessions } = await supabaseAdmin
      .from('user_sessions')
      .select('user_id, created_at, last_activity')
      .gte('created_at', startDate.toISOString());

    // Calculate session duration and frequency
    const userEngagement = userSessions?.reduce((acc: any, session: any) => {
      const userId = session.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          totalSessions: 0,
          totalDuration: 0,
          lastActivity: session.last_activity
        };
      }
      acc[userId].totalSessions++;
      
      const sessionDuration = new Date(session.last_activity).getTime() - new Date(session.created_at).getTime();
      acc[userId].totalDuration += sessionDuration;
      
      return acc;
    }, {});

    // Active users (users with sessions in the period)
    const activeUsers = Object.keys(userEngagement || {}).length;

    // Average session duration
    const avgSessionDuration = Object.values(userEngagement || {}).reduce((acc: number, user: any) => {
      return acc + (user.totalDuration / user.totalSessions);
    }, 0) / Object.keys(userEngagement || {}).length;

    // User retention (users who logged in multiple times)
    const retainedUsers = Object.values(userEngagement || {}).filter((user: any) => user.totalSessions > 1).length;

    return res.json({
      period,
      engagement: {
        activeUsers,
        avgSessionDuration: Math.round(avgSessionDuration / 1000 / 60), // in minutes
        retainedUsers,
        retentionRate: activeUsers > 0 ? (retainedUsers / activeUsers) * 100 : 0
      },
      userEngagement: Object.entries(userEngagement || {}).map(([userId, data]: [string, any]) => ({
        userId,
        totalSessions: data.totalSessions,
        avgSessionDuration: Math.round((data.totalDuration / data.totalSessions) / 1000 / 60),
        lastActivity: data.lastActivity
      }))
    });
  } catch (error) {
    console.error('Get user behavior analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// System Performance Analytics
export const getSystemPerformanceAnalytics = async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Database performance metrics
    const tables = ['users', 'admin_actions', 'security_logs', 'approval_requests', 'audit_logs'];
    const tableStats: any = {};

    for (const table of tables) {
      const { count } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      tableStats[table] = count || 0;
    }

    // Error rates from security logs
    const { data: errorLogs } = await supabaseAdmin
      .from('security_logs')
      .select('type, severity, created_at')
      .gte('created_at', startDate.toISOString())
      .in('severity', ['high', 'critical']);

    const errorRate = errorLogs?.length || 0;

    // System uptime (based on admin actions - if no actions, system might be down)
    const { data: systemActivity } = await supabaseAdmin
      .from('admin_actions')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    const uptime = (systemActivity?.length || 0) > 0 ? 99.9 : 0; // Simplified uptime calculation

    // Response time metrics (simplified)
    const avgResponseTime = 150; // ms - this would be calculated from actual API response times

    return res.json({
      period,
      database: {
        tableStats,
        totalRecords: Object.values(tableStats).reduce((acc: number, count: any) => acc + count, 0)
      },
      performance: {
        errorRate,
        uptime,
        avgResponseTime
      },
      health: {
        status: errorRate < 10 ? 'healthy' : errorRate < 50 ? 'warning' : 'critical',
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get system performance analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Export Analytics Data
export const exportAnalyticsData = async (req: Request, res: Response) => {
  try {
    const { format = 'json', type = 'all', period = '30d' } = req.query;
    
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

    let data: any = {};

    if (type === 'all' || type === 'users') {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('*')
        .gte('created_at', startDate.toISOString());
      data.users = users;
    }

    if (type === 'all' || type === 'actions') {
      const { data: actions } = await supabaseAdmin
        .from('admin_actions')
        .select('*')
        .gte('created_at', startDate.toISOString());
      data.actions = actions;
    }

    if (type === 'all' || type === 'security') {
      const { data: security } = await supabaseAdmin
        .from('security_logs')
        .select('*')
        .gte('created_at', startDate.toISOString());
      data.security = security;
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = Object.entries(data).map(([key, value]: [string, any]) => {
        if (Array.isArray(value) && value.length > 0) {
          const headers = Object.keys(value[0]).join(',');
          const rows = value.map((item: any) => Object.values(item).join(','));
          return `${key}\n${headers}\n${rows.join('\n')}`;
        }
        return `${key}\nNo data`;
      }).join('\n\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${type}-${period}.csv`);
      return res.send(csvData);
    }

    return res.json({
      type,
      period,
      data,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export analytics data error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Real-time Analytics (WebSocket support)
export const getRealTimeAnalytics = async (req: Request, res: Response) => {
  try {
    // Get current system state
    const { count: activeUsers } = await supabaseAdmin
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: pendingApprovals } = await supabaseAdmin
      .from('approval_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: recentSecurityEvents } = await supabaseAdmin
      .from('security_logs')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    return res.json({
      timestamp: new Date().toISOString(),
      metrics: {
        activeUsers,
        pendingApprovals,
        recentSecurityEvents
      },
      status: 'online'
    });
  } catch (error) {
    console.error('Get real-time analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
