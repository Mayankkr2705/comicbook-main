import express from 'express';
import { checkJwt, addUserInfo } from '../middleware/auth.js';
import { getCurrentUser, updateProfile, getUserStories } from '../controllers/userController.js';

const router = express.Router();

// GET current user profile (protected)
router.get('/me', checkJwt, addUserInfo, getCurrentUser);

// PUT update user profile (protected)
router.put('/me', checkJwt, addUserInfo, updateProfile);

// GET public stories by user ID (public route)
router.get('/:id/stories', getUserStories);

export default router;
