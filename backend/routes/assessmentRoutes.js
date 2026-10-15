import { Router } from 'express';
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  assignAssessment,
  createCodingQuestion,
  getCodingQuestions,
  getAssessmentResults,
  getMyAssessmentHistory,
} from '../controllers/assessmentController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/', getAssessments);
router.get('/history', authorize('candidate'), getMyAssessmentHistory);
router.get('/questions', getCodingQuestions);
router.get('/:id', getAssessmentById);
router.get('/:id/results', authorize('recruiter'), getAssessmentResults);
router.post('/', authorize('recruiter'), createAssessment);
router.post('/questions', authorize('recruiter'), createCodingQuestion);
router.post('/:id/assign', authorize('recruiter'), assignAssessment);

export default router;
