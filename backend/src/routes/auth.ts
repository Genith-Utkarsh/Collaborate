import { Router } from 'express';
import { register, login, getMe, refreshToken, githubLogin, githubCallback } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// GitHub OAuth routes
router.get('/github', githubLogin);
router.get('/github/callback', githubCallback);

// Protected routes
router.get('/me', authenticate, getMe);

export default router;
