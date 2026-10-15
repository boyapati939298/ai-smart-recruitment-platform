import { Router } from 'express';
import {
  getRecruiterProfile,
  updateRecruiterProfile,
  getRecruiterDashboard,
  getAllRecruiters,
  verifyRecruiter,
  getCandidateRankings,
} from '../controllers/recruiterController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect);

router.get('/profile', authorize('recruiter'), getRecruiterProfile);
router.put('/profile', authorize('recruiter'), updateRecruiterProfile);
router.get('/dashboard', authorize('recruiter'), getRecruiterDashboard);
router.get('/jobs/:jobId/rankings', authorize('recruiter'), getCandidateRankings);
router.get('/', authorize('admin'), getAllRecruiters);
router.patch('/:id/verify', authorize('admin'), verifyRecruiter);

export default router;
