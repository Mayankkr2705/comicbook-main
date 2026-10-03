import Comment from '../models/Comment.js';
import Story from '../models/Story.js';

/**
 * Get all comments for a story with author details
 */
export const getComments = async (req, res) => {
    try {
        const { storyId } = req.params;

        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Fetch comments with author details
        const comments = await Comment.find({ story: storyId })
            .populate('author', 'username email')
            .sort({ createdAt: 1 }); // Oldest first (chronological order)

        res.json({
            success: true,
            comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Create a new comment on a story
 */
export const createComment = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        // Validate content
        if (!content || typeof content !== 'string' || content.trim().length === 0) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ error: 'Comment content must be 1000 characters or less' });
        }

        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Create new comment
        const comment = new Comment({
            story: storyId,
            author: userId,
            content: content.trim()
        });

        await comment.save();

        // Populate author details for response
        await comment.populate('author', 'username email');

        res.status(201).json({
            success: true,
            comment
        });
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a comment with ownership verification
 */
export const deleteComment = async (req, res) => {
    try {
        const { storyId, commentId } = req.params;
        const userId = req.user.id;

        // Find the comment
        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Verify the comment belongs to the specified story
        if (comment.story.toString() !== storyId) {
            return res.status(400).json({ error: 'Comment does not belong to this story' });
        }

        // Verify ownership - only the comment author can delete
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to delete this comment' });
        }

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: error.message });
    }
};
