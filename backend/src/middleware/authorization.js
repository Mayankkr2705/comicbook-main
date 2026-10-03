import Story from '../models/Story.js';
import Comment from '../models/Comment.js';

/**
 * Authorization middleware to verify resource ownership
 */

/**
 * Verify that the authenticated user is the author of the story
 */
export const isStoryAuthor = async (req, res, next) => {
    try {
        const storyId = req.params.id || req.params.storyId;
        const userId = req.user.id;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        if (story.author.toString() !== userId) {
            return res.status(403).json({
                error: 'Forbidden: You are not authorized to perform this action on this story'
            });
        }

        // Attach story to request for use in route handler
        req.story = story;
        next();
    } catch (error) {
        console.error('Error in isStoryAuthor middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verify that the authenticated user is the author of the comment
 */
export const isCommentAuthor = async (req, res, next) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        if (comment.author.toString() !== userId) {
            return res.status(403).json({
                error: 'Forbidden: You are not authorized to perform this action on this comment'
            });
        }

        // Attach comment to request for use in route handler
        req.comment = comment;
        next();
    } catch (error) {
        console.error('Error in isCommentAuthor middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Verify that the authenticated user can access the story (for private stories)
 */
export const canAccessStory = async (req, res, next) => {
    try {
        const storyId = req.params.id || req.params.storyId;
        const userId = req.user?.id;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // If story is public, allow access
        if (story.visibility === 'public') {
            req.story = story;
            return next();
        }

        // If story is private, only author can access
        if (!userId || story.author.toString() !== userId) {
            return res.status(403).json({
                error: 'Access denied to private story'
            });
        }

        req.story = story;
        next();
    } catch (error) {
        console.error('Error in canAccessStory middleware:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
