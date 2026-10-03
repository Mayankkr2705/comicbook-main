/**
 * Validation middleware for request data
 */

/**
 * Validate story input for creation/update
 */
export const validateStoryInput = (req, res, next) => {
    const { title, images, visibility } = req.body;

    // Validate title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
            error: 'Title is required and must be a non-empty string'
        });
    }

    if (title.trim().length > 100) {
        return res.status(400).json({
            error: 'Title must be 100 characters or less'
        });
    }

    // Validate images
    if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({
            error: 'Images array is required and must contain at least one image'
        });
    }

    if (images.length > 10) {
        return res.status(400).json({
            error: 'Maximum 10 images allowed per story'
        });
    }

    // Validate each image object
    for (const image of images) {
        if (!image.url || typeof image.url !== 'string') {
            return res.status(400).json({
                error: 'Each image must have a valid URL'
            });
        }
    }

    // Validate visibility
    if (visibility && !['public', 'private'].includes(visibility)) {
        return res.status(400).json({
            error: 'Visibility must be either "public" or "private"'
        });
    }

    // Validate description if provided
    if (req.body.description && typeof req.body.description === 'string') {
        if (req.body.description.length > 500) {
            return res.status(400).json({
                error: 'Description must be 500 characters or less'
            });
        }
    }

    next();
};

/**
 * Validate comment input
 */
export const validateCommentInput = (req, res, next) => {
    const { content } = req.body;

    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({
            error: 'Comment content is required and must be a non-empty string'
        });
    }

    if (content.trim().length > 500) {
        return res.status(400).json({
            error: 'Comment must be 500 characters or less'
        });
    }

    next();
};

/**
 * Validate vote input
 */
export const validateVoteInput = (req, res, next) => {
    const { voteType } = req.body;

    // Validate voteType
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        return res.status(400).json({
            error: 'Valid voteType required (upvote or downvote)'
        });
    }

    next();
};

/**
 * Validate AI generation input
 */
export const validateAIInput = (req, res, next) => {
    const { prompt, provider, panels } = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({
            error: 'Prompt is required and must be a non-empty string'
        });
    }

    if (prompt.trim().length > 500) {
        return res.status(400).json({
            error: 'Prompt must be 500 characters or less'
        });
    }

    // Validate provider
    if (provider && !['gemini', 'openrouter'].includes(provider)) {
        return res.status(400).json({
            error: 'Provider must be either "gemini" or "openrouter"'
        });
    }

    // Validate panels
    if (panels !== undefined) {
        const panelCount = parseInt(panels);
        if (isNaN(panelCount) || panelCount < 1 || panelCount > 6) {
            return res.status(400).json({
                error: 'Panels must be a number between 1 and 6'
            });
        }
    }

    next();
};
