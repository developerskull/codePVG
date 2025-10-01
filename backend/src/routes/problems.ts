import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  validateCreateProblem,
  validateUpdateProblem
} from '../controllers/problemController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', getProblems);
router.get('/:id', getProblemById);

// Protected routes
router.post('/', authenticateToken, requireAdmin, validateCreateProblem, createProblem);
router.put('/:id', authenticateToken, requireAdmin, validateUpdateProblem, updateProblem);
router.delete('/:id', authenticateToken, requireAdmin, deleteProblem);

export default router;
