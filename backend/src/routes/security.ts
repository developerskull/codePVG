import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import {
  getSecurityDashboard,
  getBlockedIPs,
  unblockIP,
  getUserSecurityStatus,
  forceLogoutUser,
  getSecurityPolicies,
  updateSecurityPolicies,
  getSecurityAlerts,
  acknowledgeAlert
} from '../controllers/securityController';

const router = Router();

// Middleware to check if user is authenticated (temporarily allowing any authenticated user)
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // For now, allow any authenticated user to access security routes
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Apply authentication check to all routes
router.use(verifySupabaseToken);
router.use(requireAuth);

// Security Dashboard Routes
router.get('/dashboard', getSecurityDashboard);

// IP Management Routes
router.get('/blocked-ips', getBlockedIPs);
router.post('/blocked-ips/:ip/unblock', unblockIP);

// User Security Routes
router.get('/users/:userId/status', getUserSecurityStatus);
router.post('/users/:userId/force-logout', forceLogoutUser);

// Security Policies Routes
router.get('/policies', getSecurityPolicies);
router.put('/policies', updateSecurityPolicies);

// Security Alerts Routes
router.get('/alerts', getSecurityAlerts);
router.post('/alerts/:alertId/acknowledge', acknowledgeAlert);

export default router;
