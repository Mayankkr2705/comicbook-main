import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Trash2, User, Loader2 } from "lucide-react";
import { commentService } from "../services/commentService";
import CommentInput from "./CommentInput";

/**
 * CommentSection component displays comments with author info and delete functionality
 * @param {Object} props
 * @param {string} props.storyId - Story ID to fetch comments for
 */
export default function CommentSection({ storyId }) {
    const { user, isAuthenticated, getAccessToken } = useAuth();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const COMMENTS_PER_PAGE = 10;

    // Fetch comments
    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await commentService.getComments(storyId);

            if (response.success) {
                const allComments = response.comments || [];
                setComments(allComments);
                setHasMore(allComments.length > COMMENTS_PER_PAGE);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError(err.message || "Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [storyId]);

    // Handle new comment added
    const handleCommentAdded = (newComment) => {
        setComments((prev) => [newComment, ...prev]);
    };

    // Handle delete comment
    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) {
            return;
        }

        try {
            setDeletingId(commentId);

            const response = await commentService.deleteComment(
                getAccessToken,
                storyId,
                commentId
            );

            if (response.success) {
                setComments((prev) => prev.filter((c) => c._id !== commentId));
            }
        } catch (err) {
            console.error("Error deleting comment:", err);
            alert(err.message || "Failed to delete comment");
        } finally {
            setDeletingId(null);
        }
    };

    // Format timestamp
    const formatTimestamp = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now - commentDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return commentDate.toLocaleDateString();
    };

    // Check if user owns a comment
    const isCommentOwner = (comment) => {
        if (!isAuthenticated || !user) return false;
        return comment.author?._id === user._id || comment.author?.id === user.id;
    };

    // Get visible comments based on pagination
    const visibleComments = comments.slice(0, page * COMMENTS_PER_PAGE);
    const canLoadMore = comments.length > visibleComments.length;

    // Get initials for fallback avatar
    const getInitials = (author) => {
        const name = author?.username || author?.email || "Anonymous";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Comment Input */}
            <CommentInput storyId={storyId} onCommentAdded={handleCommentAdded} />

            {/* Comments Header */}
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-3xl font-bold text-purple-900">
                    Comments ({comments.length})
                </h3>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-300 rounded-2xl p-6 text-center">
                    <p className="text-red-700 font-bold text-lg mb-3">❌ {error}</p>
                    <button
                        onClick={fetchComments}
                        className="btn-fun bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white px-6 py-3 rounded-full font-bold shadow-lg"
                    >
                        🔄 Try Again
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && comments.length === 0 && (
                <div className="text-center py-12 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-4 border-yellow-300">
                    <p className="text-purple-700 text-xl font-bold">💭 No comments yet. Be the first to comment!</p>
                </div>
            )}

            {/* Comments List */}
            {!loading && !error && visibleComments.length > 0 && (
                <div className="space-y-4">
                    {visibleComments.map((comment) => (
                        <div
                            key={comment._id}
                            className="card-fun bg-white rounded-2xl p-5 shadow-lg border-4 border-purple-200 hover:border-purple-400 transition-all"
                        >
                            <div className="flex items-start justify-between gap-3">
                                {/* Author Info */}
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center flex-shrink-0 border-3 border-white shadow-md">
                                        {comment.author?.picture ? (
                                            <img
                                                src={comment.author.picture}
                                                alt={comment.author.username || "User"}
                                                className="w-full h-full rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-full h-full rounded-full flex items-center justify-center"
                                            style={{ display: comment.author?.picture ? 'none' : 'flex' }}
                                        >
                                            <span className="text-white text-xl font-bold">
                                                {getInitials(comment.author)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <p className="text-purple-900 font-bold text-lg">
                                                {comment.author?.username ||
                                                    comment.author?.email ||
                                                    "Anonymous"}
                                            </p>
                                            <span className="text-purple-400 text-lg font-bold">•</span>
                                            <p className="text-purple-600 text-sm font-medium">
                                                {formatTimestamp(comment.createdAt)}
                                            </p>
                                        </div>
                                        <p className="text-purple-800 whitespace-pre-wrap break-words text-lg leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                {isCommentOwner(comment) && (
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        disabled={deletingId === comment._id}
                                        className="btn-fun bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white p-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                        aria-label="Delete comment"
                                    >
                                        {deletingId === comment._id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load More Button */}
            {canLoadMore && (
                <div className="text-center">
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="btn-fun bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl"
                    >
                        📚 Load More Comments
                    </button>
                </div>
            )}
        </div>
    );
}
