import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import recruiterRoutes from './recruiterRoutes.js';
import jobRoutes from './jobRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import aiRoutes from './aiRoutes.js';
import assessmentRoutes from './assessmentRoutes.js';
import submissionRoutes from './submissionRoutes.js';
import interviewRoutes from './interviewRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import adminRoutes from './adminRoutes.js';
import messageRoutes from './messageRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/recruiters', recruiterRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/resume', resumeRoutes);
router.use('/ai', aiRoutes);
router.use('/assessments', assessmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/interviews', interviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/messages', messageRoutes);

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'Smart Recruitment API is running' });
});

export default router;
