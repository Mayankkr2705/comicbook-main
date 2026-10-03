import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    content: {
        type: String,
        trim: true,
        maxlength: 5000
    },
    images: {
        type: [{
            url: {
                type: String,
                required: true
            },
            sequenceIndex: {
                type: Number,
                required: true
            }
        }],
        default: []
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    author: {
        // author will be the Auth0 user id (string) which we store as the User _id
        type: String,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for comment count
storySchema.virtual('commentCount', {
    ref: 'Comment',
    localField: '_id',
    foreignField: 'story',
    count: true
});

// Index for sorting images by sequence
storySchema.index({ 'images.sequenceIndex': 1 });

// Index for fetching user's stories sorted by date
storySchema.index({ author: 1, createdAt: -1 });

// Index for fetching public stories sorted by date
storySchema.index({ visibility: 1, createdAt: -1 });

// Index for trending stories (sorted by upvotes)
storySchema.index({ upvotes: -1 });

const Story = mongoose.model('Story', storySchema);

export default Story;
