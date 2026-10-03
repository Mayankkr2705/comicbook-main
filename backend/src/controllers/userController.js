import User from '../models/User.js';
import Story from '../models/Story.js';

/**
 * Get authenticated user's profile
 */
export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-__v');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update user profile (username and email)
 */
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        // Find the user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate and update username if provided
        if (username !== undefined) {
            if (typeof username !== 'string' || username.trim().length < 3) {
                return res.status(400).json({ error: 'Username must be at least 3 characters long' });
            }

            // Check if username is already taken by another user
            const existingUser = await User.findOne({
                username: username.trim(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }

            user.username = username.trim();
        }

        // Validate and update email if provided
        if (email !== undefined) {
            if (typeof email !== 'string' || !email.includes('@')) {
                return res.status(400).json({ error: 'Valid email is required' });
            }

            // Check if email is already taken by another user
            const existingUser = await User.findOne({
                email: email.toLowerCase().trim(),
                _id: { $ne: userId }
            });

            if (existingUser) {
                return res.status(400).json({ error: 'Email is already taken' });
            }

            user.email = email.toLowerCase().trim();
        }

        await user.save();

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error updating profile:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: error.message });
    }
};

/**
 * Get public stories by user ID
 */
export const getUserStories = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch only public stories by this user
        const stories = await Story.find({
            author: id,
            visibility: 'public'
        })
            .populate('author', 'username email')
            .populate('commentCount')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username
            },
            stories
        });
    } catch (error) {
        console.error('Error fetching user stories:', error);
        res.status(500).json({ error: error.message });
    }
};
