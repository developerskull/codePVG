import { Router } from 'express';
import {
  submitCode,
  getSubmission,
  getUserSubmissions,
  validateSubmitCode
} from '../controllers/submissionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/submit', validateSubmitCode, submitCode);
router.get('/:id', getSubmission);
router.get('/', getUserSubmissions);

export default router;
