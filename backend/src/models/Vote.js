import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
        required: true
    },
    user: {
        type: String,
        ref: 'User',
        required: true
    },
    voteType: {
        type: String,
        enum: ['upvote', 'downvote'],
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure one vote per user per story
voteSchema.index({ story: 1, user: 1 }, { unique: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote;
