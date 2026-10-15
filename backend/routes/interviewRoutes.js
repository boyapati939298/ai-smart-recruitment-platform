import { Router } from 'express';
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  updateInterviewFeedback,
  generateAIQuestions,
  getInterviewByRoom,
} from '../controllers/interviewController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.get('/room/:roomId', protect, getInterviewByRoom);

router.use(protect);

router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.post('/', authorize('recruiter'), scheduleInterview);
router.put('/:id/feedback', authorize('recruiter'), updateInterviewFeedback);
router.post('/:id/ai-questions', authorize('recruiter'), generateAIQuestions);

export default router;
