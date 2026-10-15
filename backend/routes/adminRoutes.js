import { Router } from 'express';
import { getAnalytics, generateReport } from '../controllers/adminController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/reports', generateReport);

export default router;
