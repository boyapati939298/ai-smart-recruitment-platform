import { Router } from 'express';
import {
  getJobMatch,
  generateQuestions,
  getMyQuestions,
  evaluateAnswer,
  getCareerAdvice,
  getRecommendedJobs,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect, authorize('candidate'));

router.get('/job-match/:jobId', getJobMatch);
router.post('/interview-questions', generateQuestions);
router.get('/interview-questions', getMyQuestions);
router.post('/evaluate-answer', evaluateAnswer);
router.get('/career-guidance', getCareerAdvice);
router.get('/recommended-jobs', getRecommendedJobs);

export default router;
