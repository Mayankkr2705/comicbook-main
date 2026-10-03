import express from 'express';
import Story from '../models/Story.js';
import Vote from '../models/Vote.js';
import Comment from '../models/Comment.js';
import { checkJwt, addUserInfo, optionalAuth } from '../middleware/auth.js';
import { voteStory, removeVote } from '../controllers/voteController.js';
import commentRouter from './comment.js';

const router = express.Router();

// Mount comment routes under /stories/:storyId/comments
router.use('/:storyId/comments', commentRouter);

// GET all public stories (no auth required)
router.get('/public', async (req, res) => {
    try {
        // Parse pagination parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validate pagination parameters
        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100'
            });
        }

        const skip = (page - 1) * limit;

        // Get total count for pagination metadata
        const totalCount = await Story.countDocuments({ visibility: 'public' });
        const totalPages = Math.ceil(totalCount / limit);

        const stories = await Story.find({ visibility: 'public' })
            // populate the author's username and email
            .populate('author', 'username email')
            // populate comment count
            .populate('commentCount')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            success: true,
            stories,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching public stories:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET all stories by current user (auth required)
router.get('/my-stories', checkJwt, addUserInfo, async (req, res) => {
    try {
        const stories = await Story.find({ author: req.user.id })
            .sort({ createdAt: -1 });

        res.json({ success: true, stories });
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single story by ID (optionalAuth so guests see public stories, logged-in users see vote status)
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id)
            .populate('author', 'username email')
            .populate('commentCount');

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Check if story is private and user is not the author
        if (story.visibility === 'private') {
            if (!req.user || req.user.id !== story.author._id.toString()) {
                return res.status(403).json({ error: 'Access denied to private story' });
            }
        }

        // Check for user's vote if authenticated
        let userVote = null;
        if (req.user) {
            const vote = await Vote.findOne({ story: req.params.id, user: req.user.id });
            if (vote) {
                userVote = vote.voteType;
            }
        }

        // Include userVote in response
        const storyResponse = story.toObject();
        storyResponse.userVote = userVote;

        res.json({ success: true, story: storyResponse });
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ error: error.message });
    }
});

// CREATE new story (auth required)
router.post('/', checkJwt, addUserInfo, async (req, res) => {
    try {
        const { title, description, content, images, visibility } = req.body;

        // Validate required fields
        if (!title || title.trim().length === 0) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Must have either images OR content
        const hasImages = images && Array.isArray(images) && images.length > 0;
        const hasContent = content && typeof content === 'string' && content.trim().length > 0;

        if (!hasImages && !hasContent) {
            return res.status(400).json({ 
                error: 'Story must have either images or text content' 
            });
        }

        const storyData = {
            title: title.trim(),
            description: description ? description.trim() : undefined,
            visibility: visibility || 'public',
            author: req.user.id
        };

        // Add images if provided
        if (hasImages) {
            storyData.images = images;
        } else {
            // For text-only stories, provide empty images array
            storyData.images = [];
        }

        // Add content if provided
        if (hasContent) {
            storyData.content = content.trim();
        }

        const story = new Story(storyData);
        await story.save();

        res.status(201).json({ success: true, story });
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE story (auth required, only author can update)
router.put('/:id', checkJwt, addUserInfo, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Check if user is the author
        if (story.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update this story' });
        }

        const { images, visibility } = req.body;

        if (images) story.images = images;
        if (visibility) story.visibility = visibility;

        await story.save();

        res.json({ success: true, story });
    } catch (error) {
        console.error('Error updating story:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE story (auth required, only author can delete)
router.delete('/:id', checkJwt, addUserInfo, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Check if user is the author
        if (story.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this story' });
        }

        // Cascade delete: Delete all comments and votes associated with this story
        await Comment.deleteMany({ story: req.params.id });
        await Vote.deleteMany({ story: req.params.id });

        // Delete the story itself
        await Story.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Story deleted successfully' });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ error: error.message });
    }
});

// VOTE on story (auth required) - handles both upvote and downvote
router.post('/:id/vote', checkJwt, addUserInfo, voteStory);

// REMOVE vote from story (auth required)
router.delete('/:id/vote', checkJwt, addUserInfo, removeVote);

// UPDATE visibility (auth required, only author can update)
router.patch('/:id/visibility', checkJwt, addUserInfo, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Check if user is the author
        if (story.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to update visibility' });
        }

        const { visibility } = req.body;

        if (!visibility || !['public', 'private'].includes(visibility)) {
            return res.status(400).json({ error: 'Valid visibility value required (public or private)' });
        }

        story.visibility = visibility;
        await story.save();

        res.json({ success: true, story });
    } catch (error) {
        console.error('Error updating visibility:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
