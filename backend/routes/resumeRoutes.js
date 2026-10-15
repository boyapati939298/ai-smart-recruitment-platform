import { Router } from 'express';
import {
  uploadResume,
  getResumeAnalysis,
  downloadResume,
  analyzeExistingResume,
} from '../controllers/resumeController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadResume as uploadMiddleware } from '../middlewares/upload.js';

const router = Router();

router.use(protect, authorize('candidate'));

router.post('/upload', uploadMiddleware.single('resume'), uploadResume);
router.get('/analysis', getResumeAnalysis);
router.get('/download', downloadResume);
router.post('/analyze', analyzeExistingResume);

export default router;
