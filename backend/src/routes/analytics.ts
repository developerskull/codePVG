import { Router } from 'express';
import { verifySupabaseToken } from '../controllers/supabaseAuthController';
import {
  getDashboardAnalytics,
  getUserBehaviorAnalytics,
  getSystemPerformanceAnalytics,
  exportAnalyticsData,
  getRealTimeAnalytics
} from '../controllers/analyticsController';

const router = Router();

// Middleware to check if user is authenticated (temporarily allowing any authenticated user)
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    // For now, allow any authenticated user to access analytics routes
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Apply authentication check to all routes
router.use(verifySupabaseToken);
router.use(requireAuth);

// Analytics Routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/user-behavior', getUserBehaviorAnalytics);
router.get('/system-performance', getSystemPerformanceAnalytics);
router.get('/export', exportAnalyticsData);
router.get('/realtime', getRealTimeAnalytics);

export default router;
