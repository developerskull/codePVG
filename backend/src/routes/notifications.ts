import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import {
  createSystemNotification,
  getSystemNotifications,
  updateSystemNotification,
  deleteSystemNotification,
  getUserNotifications,
  sendEmailNotification,
  bulkCreateNotifications,
  bulkDeleteNotifications,
  getNotificationTemplates,
  getNotificationAnalytics
} from '../controllers/notificationController';

const router = Router();

// Middleware to check if user is super-admin
const requireSuperAdmin = async (req: any, res: any, next: any) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Apply authentication to all routes
router.use(verifySupabaseToken);

// System Notifications Routes (super admin only)
router.post('/system', requireSuperAdmin, createSystemNotification);
router.get('/system', requireSuperAdmin, getSystemNotifications);
router.put('/system/:id', requireSuperAdmin, updateSystemNotification);
router.delete('/system/:id', requireSuperAdmin, deleteSystemNotification);

// User Notifications Routes (all authenticated users)
router.get('/user', getUserNotifications);

// Email Notifications Routes (super admin only)
router.post('/email', requireSuperAdmin, sendEmailNotification);

// Bulk Operations Routes (super admin only)
router.post('/bulk/create', requireSuperAdmin, bulkCreateNotifications);
router.post('/bulk/delete', requireSuperAdmin, bulkDeleteNotifications);

// Templates and Analytics Routes (super admin only)
router.get('/templates', requireSuperAdmin, getNotificationTemplates);
router.get('/analytics', requireSuperAdmin, getNotificationAnalytics);

export default router;
