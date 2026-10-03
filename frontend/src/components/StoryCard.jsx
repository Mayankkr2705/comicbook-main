import { MessageCircle, User } from "lucide-react";
import VoteButtons from "./VoteButtons";

/**
 * StoryCard component displays a comic strip preview with engagement metrics
 * @param {Object} props
 * @param {Object} props.story - Story object with images, author, engagement data
 * @param {Function} props.onClick - Handler for card click to navigate to detail
 * @param {Function} props.onVoteChange - Optional callback when vote changes
 */
export default function StoryCard({ story, onClick, onVoteChange }) {
    // Format timestamp to relative time
    const formatTimestamp = (date) => {
        const now = new Date();
        const storyDate = new Date(date);
        const diffMs = now - storyDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return storyDate.toLocaleDateString();
    };

    // Get first image as preview
    const previewImage = story.images?.[0]?.url;
    const authorName = story.author?.username || story.author?.email || "Anonymous";
    const commentCount = story.commentCount || 0;

    return (
        <div
            className="card-fun bg-white rounded-3xl overflow-hidden hover:scale-105 transition-all cursor-pointer shadow-xl"
            onClick={onClick}
        >
            {/* Author Header */}
            <div className="p-5 flex items-center justify-between bg-gradient-to-r from-purple-100 to-pink-100">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center border-3 border-white shadow-lg">
                        <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-purple-900 font-bold">{authorName}</p>
                        <p className="text-purple-600 text-sm font-medium">{formatTimestamp(story.createdAt)}</p>
                    </div>
                </div>
            </div>

            {/* Comic Preview Image or Text Preview */}
            {previewImage ? (
                <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-purple-50">
                    <img
                        src={previewImage}
                        alt={story.title || "Comic strip"}
                        className="w-full h-full object-contain"
                    />
                </div>
            ) : story.content ? (
                <div className="w-full bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 p-6 border-4 border-purple-200">
                    <p className="story-text text-gray-800 text-sm line-clamp-6">
                        {story.content}
                    </p>
                </div>
            ) : null}

            {/* Engagement Metrics */}
            <div className="p-5 border-t-4 border-purple-200 bg-gradient-to-r from-yellow-50 to-pink-50">
                <div className="flex items-center gap-6 text-purple-700">
                    <div onClick={(e) => e.stopPropagation()}>
                        <VoteButtons
                            storyId={story._id}
                            initialUpvotes={story.upvotes || 0}
                            initialDownvotes={story.downvotes || 0}
                            initialUserVote={story.userVote || null}
                            onVoteChange={onVoteChange}
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-purple-200 px-3 py-2 rounded-full">
                        <MessageCircle className="w-5 h-5 text-purple-700" />
                        <span className="text-sm font-bold text-purple-900">{commentCount} 💬</span>
                    </div>
                </div>

                {/* Title and Description */}
                {story.title && (
                    <div className="mt-4 bg-white p-3 rounded-xl border-3 border-purple-200">
                        <h3 className="text-purple-900 font-bold text-lg">{story.title}</h3>
                        {story.description && (
                            <p className="text-purple-700 text-sm mt-1 line-clamp-2 font-medium">
                                {story.description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
