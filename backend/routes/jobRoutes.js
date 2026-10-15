import { Router } from 'express';
import {
  createJob,
  getJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  closeJob,
  saveJob,
  getSavedJobs,
  adminGetAllJobs,
  flagJob,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { createJobValidator } from '../validators/jobValidator.js';

const router = Router();

router.get('/', getJobs);
router.get('/recruiter/mine', protect, authorize('recruiter'), getMyJobs);
router.get('/candidate/saved', protect, authorize('candidate'), getSavedJobs);
router.get('/admin/all', protect, authorize('admin'), adminGetAllJobs);
router.get('/:id', getJobById);

router.use(protect);

router.post('/', authorize('recruiter', 'admin'), createJobValidator, validate, createJob);
router.patch('/admin/:id/flag', authorize('admin'), flagJob);
router.post('/:id/save', authorize('candidate'), saveJob);
router.put('/:id', authorize('recruiter'), updateJob);
router.delete('/:id', authorize('recruiter'), deleteJob);
router.patch('/:id/close', authorize('recruiter'), closeJob);

export default router;
