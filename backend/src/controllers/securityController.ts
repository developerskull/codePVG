import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';
import { logSecurityEvent } from '../utils/adminSchema';

// Security Dashboard
export const getSecurityDashboard = async (req: Request, res: Response) => {
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

    // Security incidents by type
    const { data: securityIncidents } = await supabaseAdmin
      .from('security_logs')
      .select('type, severity, created_at')
      .gte('created_at', startDate.toISOString());

    const incidentStats = securityIncidents?.reduce((acc: any, incident: any) => {
      if (!acc[incident.type]) {
        acc[incident.type] = { total: 0, low: 0, medium: 0, high: 0, critical: 0 };
      }
      acc[incident.type].total++;
      acc[incident.type][incident.severity]++;
      return acc;
    }, {});

    // Failed login attempts
    const { data: failedLogins } = await supabaseAdmin
      .from('security_logs')
      .select('*')
      .eq('type', 'failed_login')
      .gte('created_at', startDate.toISOString());

    // Suspicious activities
    const { data: suspiciousActivities } = await supabaseAdmin
      .from('security_logs')
      .select('*')
      .eq('type', 'suspicious_activity')
      .gte('created_at', startDate.toISOString());

    // IP addresses with multiple failed attempts
    const ipStats = failedLogins?.reduce((acc: any, login: any) => {
      const ip = login.ip_address;
      if (!acc[ip]) acc[ip] = { attempts: 0, lastAttempt: login.created_at };
      acc[ip].attempts++;
      if (new Date(login.created_at) > new Date(acc[ip].lastAttempt)) {
        acc[ip].lastAttempt = login.created_at;
      }
      return acc;
    }, {});

    // Blocked IPs (IPs with more than 5 failed attempts)
    const blockedIPs = Object.entries(ipStats || {})
      .filter(([ip, stats]: [string, any]) => stats.attempts > 5)
      .map(([ip, stats]: [string, any]) => ({ ip, attempts: stats.attempts, lastAttempt: stats.lastAttempt }));

    // Recent security events
    const { data: recentEvents } = await supabaseAdmin
      .from('security_logs')
      .select(`
        *,
        user:user_id (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    return res.json({
      period,
      overview: {
        totalIncidents: securityIncidents?.length || 0,
        failedLogins: failedLogins?.length || 0,
        suspiciousActivities: suspiciousActivities?.length || 0,
        blockedIPs: blockedIPs.length
      },
      incidentStats,
      blockedIPs,
      recentEvents
    });
  } catch (error) {
    console.error('Get security dashboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// IP Management
export const getBlockedIPs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get IPs with multiple failed login attempts
    const { data: failedLogins } = await supabaseAdmin
      .from('security_logs')
      .select('ip_address, created_at')
      .eq('type', 'failed_login')
      .order('created_at', { ascending: false });

    const ipStats = failedLogins?.reduce((acc: any, login: any) => {
      const ip = login.ip_address;
      if (!acc[ip]) acc[ip] = { attempts: 0, firstAttempt: login.created_at, lastAttempt: login.created_at };
      acc[ip].attempts++;
      if (new Date(login.created_at) < new Date(acc[ip].firstAttempt)) {
        acc[ip].firstAttempt = login.created_at;
      }
      if (new Date(login.created_at) > new Date(acc[ip].lastAttempt)) {
        acc[ip].lastAttempt = login.created_at;
      }
      return acc;
    }, {});

    const blockedIPs = Object.entries(ipStats || {})
      .filter(([ip, stats]: [string, any]) => stats.attempts >= 5)
      .map(([ip, stats]: [string, any]) => ({
        ip,
        attempts: stats.attempts,
        firstAttempt: stats.firstAttempt,
        lastAttempt: stats.lastAttempt,
        duration: new Date(stats.lastAttempt).getTime() - new Date(stats.firstAttempt).getTime()
      }))
      .sort((a: any, b: any) => b.attempts - a.attempts)
      .slice(offset, offset + Number(limit));

    return res.json({
      blockedIPs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Object.keys(ipStats || {}).length,
        pages: Math.ceil(Object.keys(ipStats || {}).length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get blocked IPs error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const unblockIP = async (req: Request, res: Response) => {
  try {
    const { ip } = req.params;

    // Log the unblock action
    await logSecurityEvent(
      (req as any).user.id,
      'ip_unblocked',
      `IP address ${ip} has been unblocked`,
      'medium',
      { ip },
      req.ip,
      req.get('User-Agent')
    );

    return res.json({ message: `IP address ${ip} has been unblocked` });
  } catch (error) {
    console.error('Unblock IP error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// User Security Management
export const getUserSecurityStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Get user's security events
    const { data: securityEvents } = await supabaseAdmin
      .from('security_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get user's active sessions
    const { data: activeSessions } = await supabaseAdmin
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    // Calculate risk score
    const riskScore = calculateRiskScore(securityEvents || []);

    // Get recent failed login attempts
    const failedLogins = securityEvents?.filter(event => 
      event.type === 'failed_login' && 
      new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || [];

    return res.json({
      userId,
      riskScore,
      activeSessions: activeSessions?.length || 0,
      recentFailedLogins: failedLogins.length,
      securityEvents: securityEvents?.slice(0, 10) || [],
      status: riskScore > 70 ? 'high_risk' : riskScore > 30 ? 'medium_risk' : 'low_risk'
    });
  } catch (error) {
    console.error('Get user security status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const forceLogoutUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Deactivate all user sessions
    const { error } = await supabaseAdmin
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the action
    await logSecurityEvent(
      (req as any).user.id,
      'force_logout',
      `User ${userId} has been force logged out`,
      'medium',
      { targetUserId: userId },
      req.ip,
      req.get('User-Agent')
    );

    return res.json({ message: 'User has been force logged out' });
  } catch (error) {
    console.error('Force logout user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Security Policies
export const getSecurityPolicies = async (req: Request, res: Response) => {
  try {
    const { data: policies, error } = await supabaseAdmin
      .from('system_settings')
      .select('security_settings')
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    return res.json(policies?.security_settings || {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      sessionPolicy: {
        maxSessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        maxConcurrentSessions: 3
      },
      loginPolicy: {
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
        requireEmailVerification: true
      },
      ipWhitelist: [],
      ipBlacklist: []
    });
  } catch (error) {
    console.error('Get security policies error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSecurityPolicies = async (req: Request, res: Response) => {
  try {
    const securitySettings = req.body;

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .upsert({
        security_settings: securitySettings,
        updated_at: new Date().toISOString(),
        updated_by: (req as any).user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log the policy update
    await logSecurityEvent(
      (req as any).user.id,
      'security_policy_updated',
      'Security policies have been updated',
      'high',
      { policies: securitySettings },
      req.ip,
      req.get('User-Agent')
    );

    return res.json({ message: 'Security policies updated successfully', policies: data });
  } catch (error) {
    console.error('Update security policies error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Security Alerts
export const getSecurityAlerts = async (req: Request, res: Response) => {
  try {
    const { severity = '', status = 'active' } = req.query;

    let query = supabaseAdmin
      .from('security_logs')
      .select('*')
      .in('severity', ['high', 'critical'])
      .order('created_at', { ascending: false });

    if (severity) {
      query = query.eq('severity', severity);
    }

    const { data: alerts, error } = await query.limit(50);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json(alerts);
  } catch (error) {
    console.error('Get security alerts error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { comments = '' } = req.body;

    // Update the alert status
    const { data: alert, error } = await supabaseAdmin
      .from('security_logs')
      .update({
        metadata: {
          acknowledged: true,
          acknowledgedBy: (req as any).user.id,
          acknowledgedAt: new Date().toISOString(),
          comments
        }
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Alert acknowledged successfully', alert });
  } catch (error) {
    console.error('Acknowledge alert error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to calculate risk score
const calculateRiskScore = (securityEvents: any[]): number => {
  let score = 0;
  
  // Failed login attempts (recent)
  const recentFailedLogins = securityEvents.filter(event => 
    event.type === 'failed_login' && 
    new Date(event.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;
  score += recentFailedLogins * 10;

  // Suspicious activities
  const suspiciousActivities = securityEvents.filter(event => 
    event.type === 'suspicious_activity'
  ).length;
  score += suspiciousActivities * 20;

  // High severity events
  const highSeverityEvents = securityEvents.filter(event => 
    event.severity === 'high' || event.severity === 'critical'
  ).length;
  score += highSeverityEvents * 30;

  return Math.min(score, 100);
};
