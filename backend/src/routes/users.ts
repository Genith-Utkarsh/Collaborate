import { Router } from 'express';
import { 
  getUserProfile, 
  getCurrentUser,
  updateProfile, 
  getAllUsers,
  followUser,
  unfollowUser
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Protected routes
router.get('/profile', authenticate, getCurrentUser);
router.get('/profile/:id', getUserProfile);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);
router.get('/', getAllUsers);
router.post('/follow/:id', authenticate, followUser);
router.post('/unfollow/:id', authenticate, unfollowUser);

export default router;
