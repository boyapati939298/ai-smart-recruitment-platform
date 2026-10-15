import { Router } from 'express';
import {
  applyJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getApplicationById,
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.post('/jobs/:jobId/apply', authorize('candidate'), applyJob);
router.get('/mine', authorize('candidate'), getMyApplications);
router.get('/jobs/:jobId/applicants', authorize('recruiter'), getJobApplicants);
router.get('/:id', getApplicationById);
router.patch('/:id/status', authorize('recruiter'), updateApplicationStatus);

export default router;
