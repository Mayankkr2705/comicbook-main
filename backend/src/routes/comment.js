import express from 'express';
import { checkJwt, addUserInfo } from '../middleware/auth.js';
import { getComments, createComment, deleteComment } from '../controllers/commentController.js';

const router = express.Router({ mergeParams: true }); // mergeParams to access :storyId from parent router

// GET all comments for a story (no auth required)
router.get('/', getComments);

// POST create a new comment (auth required)
router.post('/', checkJwt, addUserInfo, createComment);

// DELETE a comment (auth required, ownership verified in controller)
router.delete('/:commentId', checkJwt, addUserInfo, deleteComment);

export default router;
