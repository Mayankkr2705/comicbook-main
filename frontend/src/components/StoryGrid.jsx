import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Lock, Globe, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { storyService } from "../services/storyService";

/**
 * StoryGrid component displays user's stories in a grid layout
 * @param {Object} props
 * @param {Array} props.stories - Array of story objects
 * @param {Function} props.onStoryClick - Callback when story is clicked
 * @param {Function} props.onStoryDeleted - Callback when story is deleted
 * @param {Function} props.onVisibilityChanged - Callback when visibility is changed
 */
export default function StoryGrid({
    stories,
    onStoryClick,
    onStoryDeleted,
    onVisibilityChanged,
}) {
    const { getAccessTokenSilently } = useAuth0();
    const [deletingId, setDeletingId] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    // Handle delete story
    const handleDelete = async (e, storyId) => {
        e.stopPropagation();

        if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
            return;
        }

        try {
            setDeletingId(storyId);

            const response = await storyService.deleteStory(getAccessTokenSilently, storyId);

            if (response.success) {
                if (onStoryDeleted) {
                    onStoryDeleted(storyId);
                }
            }
        } catch (err) {
            console.error("Error deleting story:", err);
            alert(err.message || "Failed to delete story");
        } finally {
            setDeletingId(null);
        }
    };

    // Handle toggle visibility
    const handleToggleVisibility = async (e, story) => {
        e.stopPropagation();

        const newVisibility = story.visibility === "public" ? "private" : "public";

        try {
            setTogglingId(story._id);

            const response = await storyService.updateVisibility(
                getAccessTokenSilently,
                story._id,
                newVisibility
            );

            if (response.success) {
                if (onVisibilityChanged) {
                    onVisibilityChanged(story._id, newVisibility);
                }
            }
        } catch (err) {
            console.error("Error updating visibility:", err);
            alert(err.message || "Failed to update visibility");
        } finally {
            setTogglingId(null);
        }
    };

    if (!stories || stories.length === 0) {
        return (
            <div className="text-center py-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl border-4 border-purple-300 card-fun">
                <p className="text-purple-700 text-2xl font-bold">📚 No stories yet!</p>
                <p className="text-purple-600 text-lg mt-2 font-medium">
                    ✨ Create your first amazing story to see it here! ✨
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
                <div
                    key={story._id}
                    className="card-fun bg-white rounded-3xl overflow-hidden hover:scale-105 transition-all cursor-pointer group shadow-xl"
                    onClick={() => onStoryClick && onStoryClick(story._id)}
                >
                    {/* Story Preview Image or Text Preview */}
                    <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50">
                        {story.images && story.images.length > 0 ? (
                            <img
                                src={story.images[0].url}
                                alt={story.title}
                                className="w-full h-full object-cover"
                            />
                        ) : story.content ? (
                            <div className="w-full h-full flex items-center justify-center p-6">
                                <p className="story-text text-gray-800 text-sm line-clamp-6 text-center">
                                    {story.content}
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-purple-400 font-bold">
                                📝 No Content
                            </div>
                        )}

                        {/* Visibility Badge */}
                        <div className="absolute top-3 right-3">
                            {story.visibility === "private" ? (
                                <span className="px-3 py-2 bg-red-400 border-3 border-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                    <Lock className="w-4 h-4" />
                                    🔒 Private
                                </span>
                            ) : (
                                <span className="px-3 py-2 bg-green-400 border-3 border-green-600 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
                                    <Globe className="w-4 h-4" />
                                    🌍 Public
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Story Info */}
                    <div className="p-5 bg-gradient-to-r from-yellow-50 to-pink-50">
                        <h3 className="text-purple-900 font-bold text-xl mb-2 line-clamp-1">
                            {story.title}
                        </h3>
                        {story.description && (
                            <p className="text-purple-700 text-sm line-clamp-2 mb-4 font-medium">
                                {story.description}
                            </p>
                        )}

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-3 text-sm mb-4 flex-wrap">
                            <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full font-bold border-2 border-green-400">👍 {story.upvotes || 0}</span>
                            <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full font-bold border-2 border-red-400">👎 {story.downvotes || 0}</span>
                            <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full font-bold border-2 border-blue-400">💬 {story.commentCount || 0}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => handleToggleVisibility(e, story)}
                                disabled={togglingId === story._id}
                                className="btn-fun flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50 text-white text-sm font-bold"
                                title={story.visibility === "public" ? "Make Private" : "Make Public"}
                            >
                                {togglingId === story._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : story.visibility === "public" ? (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        <span>HIDE</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        <span>SHOW</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={(e) => handleDelete(e, story._id)}
                                disabled={deletingId === story._id}
                                className="btn-fun px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-50 text-white font-bold"
                                title="Delete Story"
                            >
                                {deletingId === story._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
