import express from 'express';
import { register, login, getCurrentUser, updateProfile } from '../controllers/authControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Routes công khai (không cần xác thực)
router.post('/register', register);
router.post('/login', login);

// Routes cần xác thực
router.get('/me', authenticateToken, getCurrentUser);
router.put('/profile', authenticateToken, updateProfile);

export default router;