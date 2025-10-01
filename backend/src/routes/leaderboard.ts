import { Router } from 'express';
import {
  getLeaderboard,
  getUserRank,
  getStats,
  validateLeaderboardQuery
} from '../controllers/leaderboardController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', validateLeaderboardQuery, getLeaderboard);

// Protected routes
router.get('/my-rank', authenticateToken, validateLeaderboardQuery, getUserRank);
router.get('/stats', authenticateToken, getStats);

export default router;
