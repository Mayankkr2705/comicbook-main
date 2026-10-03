import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    author: {
        type: String,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// Index for efficiently fetching comments for a story
commentSchema.index({ story: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
