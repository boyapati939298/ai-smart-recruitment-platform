import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  getDashboard,
  getAllUsers,
  suspendUser,
} from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';
import { uploadImage } from '../middlewares/upload.js';

const router = Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile/image', uploadImage.single('image'), uploadProfileImage);
router.get('/dashboard', authorize('candidate'), getDashboard);
router.get('/', authorize('admin'), getAllUsers);
router.patch('/:id/suspend', authorize('admin'), suspendUser);

export default router;
