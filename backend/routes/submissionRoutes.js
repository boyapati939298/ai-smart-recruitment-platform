import { Router } from 'express';
import {
  runCode,
  submitSolution,
  getSubmissionById,
  getMySubmissions,
} from '../controllers/submissionController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.post('/run', runCode);
router.post('/submit', submitSolution);
router.get('/mine', getMySubmissions);
router.get('/:id', getSubmissionById);

export default router;
