import Vote from '../models/Vote.js';
import Story from '../models/Story.js';

/**
 * Vote on a story (upvote or downvote)
 * Handles vote type changes and updates story counts atomically
 */
export const voteStory = async (req, res) => {
    try {
        const { id: storyId } = req.params;
        const { voteType } = req.body;
        const userId = req.user.id;

        // Validate voteType
        if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                error: 'Valid voteType required (upvote or downvote)'
            });
        }

        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Check for existing vote
        const existingVote = await Vote.findOne({ story: storyId, user: userId });

        if (existingVote) {
            // If same vote type, do nothing (idempotent)
            if (existingVote.voteType === voteType) {
                return res.json({
                    success: true,
                    message: 'Vote already recorded',
                    upvotes: story.upvotes,
                    downvotes: story.downvotes,
                    userVote: voteType
                });
            }

            // Vote type is changing - update counts atomically
            const oldVoteType = existingVote.voteType;

            // Update the vote document
            existingVote.voteType = voteType;
            await existingVote.save();

            // Update story counts atomically
            if (oldVoteType === 'upvote' && voteType === 'downvote') {
                // Changed from upvote to downvote
                await Story.findByIdAndUpdate(storyId, {
                    $inc: { upvotes: -1, downvotes: 1 }
                });
                story.upvotes -= 1;
                story.downvotes += 1;
            } else if (oldVoteType === 'downvote' && voteType === 'upvote') {
                // Changed from downvote to upvote
                await Story.findByIdAndUpdate(storyId, {
                    $inc: { upvotes: 1, downvotes: -1 }
                });
                story.upvotes += 1;
                story.downvotes -= 1;
            }

            return res.json({
                success: true,
                message: 'Vote updated',
                upvotes: story.upvotes,
                downvotes: story.downvotes,
                userVote: voteType
            });
        }

        // No existing vote - create new vote
        const newVote = new Vote({
            story: storyId,
            user: userId,
            voteType
        });

        await newVote.save();

        // Update story counts atomically
        const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        await Story.findByIdAndUpdate(storyId, {
            $inc: { [updateField]: 1 }
        });

        // Update local story object for response
        if (voteType === 'upvote') {
            story.upvotes += 1;
        } else {
            story.downvotes += 1;
        }

        res.json({
            success: true,
            message: 'Vote recorded',
            upvotes: story.upvotes,
            downvotes: story.downvotes,
            userVote: voteType
        });
    } catch (error) {
        console.error('Error voting on story:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Remove user's vote from a story
 */
export const removeVote = async (req, res) => {
    try {
        const { id: storyId } = req.params;
        const userId = req.user.id;

        // Check if story exists
        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        // Find existing vote
        const existingVote = await Vote.findOne({ story: storyId, user: userId });

        if (!existingVote) {
            return res.status(404).json({ error: 'No vote found to remove' });
        }

        const voteType = existingVote.voteType;

        // Delete the vote
        await Vote.findByIdAndDelete(existingVote._id);

        // Update story counts atomically
        const updateField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
        await Story.findByIdAndUpdate(storyId, {
            $inc: { [updateField]: -1 }
        });

        // Update local story object for response
        if (voteType === 'upvote') {
            story.upvotes -= 1;
        } else {
            story.downvotes -= 1;
        }

        res.json({
            success: true,
            message: 'Vote removed',
            upvotes: story.upvotes,
            downvotes: story.downvotes,
            userVote: null
        });
    } catch (error) {
        console.error('Error removing vote:', error);
        res.status(500).json({ error: error.message });
    }
};
