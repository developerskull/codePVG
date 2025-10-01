import { Request, Response } from 'express';
import { supabaseAdmin } from '../utils/supabase';

// System Notifications
export const createSystemNotification = async (req: Request, res: Response) => {
  try {
    const {
      title,
      message,
      type = 'info',
      targetRoles = [],
      targetUsers = [],
      isGlobal = false,
      expiresAt
    } = req.body;

    const { data: notification, error } = await supabaseAdmin
      .from('system_notifications')
      .insert({
        title,
        message,
        type,
        target_roles: targetRoles,
        target_users: targetUsers,
        is_global: isGlobal,
        expires_at: expiresAt,
        created_by: (req as any).user.id
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Notification created successfully', notification });
  } catch (error) {
    console.error('Create system notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSystemNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, type = '', status = 'active' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('system_notifications')
      .select(`
        *,
        creator:created_by (name, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (status === 'active') {
      query = query.or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());
    }

    const { data: notifications, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get system notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSystemNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const { data: notification, error } = await supabaseAdmin
      .from('system_notifications')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Notification updated successfully', notification });
  } catch (error) {
    console.error('Update system notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSystemNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('system_notifications')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete system notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// User-specific notifications
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get user's role
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let query = supabaseAdmin
      .from('system_notifications')
      .select('*', { count: 'exact' })
      .or(`is_global.eq.true,target_roles.cs.{${user?.role}},target_users.cs.{${userId}}`)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false });

    if (unreadOnly === 'true') {
      // This would require a user_notifications table to track read status
      // For now, we'll return all notifications
    }

    const { data: notifications, error, count } = await query
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        pages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Email Notifications
export const sendEmailNotification = async (req: Request, res: Response) => {
  try {
    const {
      recipients,
      subject,
      message,
      template = 'default',
      priority = 'normal'
    } = req.body;

    // This would integrate with an email service like SendGrid, AWS SES, etc.
    // For now, we'll just log the email request
    
    const emailData = {
      recipients,
      subject,
      message,
      template,
      priority,
      sentBy: (req as any).user.id,
      sentAt: new Date().toISOString()
    };

    // Log the email notification
    await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: (req as any).user.id,
        action_type: 'send_email_notification',
        target_id: null,
        details: emailData,
        ip_address: req.ip
      });

    return res.json({ 
      message: 'Email notification queued successfully',
      emailData 
    });
  } catch (error) {
    console.error('Send email notification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Bulk Operations
export const bulkCreateNotifications = async (req: Request, res: Response) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications)) {
      return res.status(400).json({ error: 'Notifications must be an array' });
    }

    const notificationsWithCreator = notifications.map(notification => ({
      ...notification,
      created_by: (req as any).user.id
    }));

    const { data, error } = await supabaseAdmin
      .from('system_notifications')
      .insert(notificationsWithCreator)
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ 
      message: `${data.length} notifications created successfully`,
      notifications: data 
    });
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const bulkDeleteNotifications = async (req: Request, res: Response) => {
  try {
    const { notificationIds } = req.body;

    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Notification IDs must be an array' });
    }

    const { error } = await supabaseAdmin
      .from('system_notifications')
      .delete()
      .in('id', notificationIds);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ 
      message: `${notificationIds.length} notifications deleted successfully` 
    });
  } catch (error) {
    console.error('Bulk delete notifications error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Notification Templates
export const getNotificationTemplates = async (req: Request, res: Response) => {
  try {
    const templates = {
      welcome: {
        title: 'Welcome to CollegeCodeHub!',
        message: 'Welcome to our platform! We\'re excited to have you join our community.',
        type: 'success'
      },
      maintenance: {
        title: 'Scheduled Maintenance',
        message: 'We will be performing scheduled maintenance. The platform may be temporarily unavailable.',
        type: 'warning'
      },
      security: {
        title: 'Security Alert',
        message: 'We have detected suspicious activity on your account. Please review your security settings.',
        type: 'error'
      },
      update: {
        title: 'Platform Update',
        message: 'We have released new features and improvements. Check out what\'s new!',
        type: 'info'
      }
    };

    return res.json(templates);
  } catch (error) {
    console.error('Get notification templates error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Notification Analytics
export const getNotificationAnalytics = async (req: Request, res: Response) => {
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
    }

    // Notification statistics
    const { data: notifications } = await supabaseAdmin
      .from('system_notifications')
      .select('type, created_at, is_global')
      .gte('created_at', startDate.toISOString());

    const stats = notifications?.reduce((acc: any, notification: any) => {
      const date = new Date(notification.created_at).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { total: 0, global: 0, targeted: 0 };
      acc[date].total++;
      if (notification.is_global) acc[date].global++;
      else acc[date].targeted++;
      return acc;
    }, {});

    // Type distribution
    const typeDistribution = notifications?.reduce((acc: any, notification: any) => {
      acc[notification.type] = (acc[notification.type] || 0) + 1;
      return acc;
    }, {});

    return res.json({
      period,
      dailyStats: stats,
      typeDistribution,
      totalNotifications: notifications?.length || 0
    });
  } catch (error) {
    console.error('Get notification analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
