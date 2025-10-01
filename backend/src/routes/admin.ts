import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import {
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  banUser,
  unbanUser,
  
  // Data Management
  getSystemStats,
  exportUserData,
  
  // System Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Analytics
  getAnalytics,
  
  // Security Dashboard
  getSecurityLogs,
  getAdminActions,
  
  // Database Management
  getDatabaseStats,
  cleanupOldData,
  
  // Approval System
  getPendingApprovals,
  approveRequest,
  rejectRequest
} from '../controllers/adminController';

import {
  getAdminDashboard,
  performQuickAction
} from '../controllers/dashboardController';

const router = Router();

// Middleware to check if user is authenticated (temporarily allowing any authenticated user)
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // For now, allow any authenticated user to access admin routes
    // In production, you would check for admin/super-admin role
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Apply authentication check to all routes
router.use(verifySupabaseToken);
router.use(requireAuth);

// Dashboard Routes
router.get('/dashboard', getAdminDashboard);
router.post('/quick-action', performQuickAction);

// User Management Routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/ban', banUser);
router.post('/users/:id/unban', unbanUser);

// Data Management Routes
router.get('/stats', getSystemStats);
router.get('/export/users', exportUserData);

// System Settings Routes
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Analytics Routes
router.get('/analytics', getAnalytics);

// Security Dashboard Routes
router.get('/security/logs', getSecurityLogs);
router.get('/security/actions', getAdminActions);

// Database Management Routes
router.get('/database/stats', getDatabaseStats);
router.post('/database/cleanup', cleanupOldData);

// Approval System Routes
router.get('/approvals', getPendingApprovals);
router.post('/approvals/:id/approve', approveRequest);
router.post('/approvals/:id/reject', rejectRequest);

export default router;
