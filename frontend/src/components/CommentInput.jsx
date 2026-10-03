import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Send, Loader2 } from "lucide-react";
import { commentService } from "../services/commentService";

/**
 * CommentInput component provides a textarea for submitting comments
 * @param {Object} props
 * @param {string} props.storyId - Story ID to comment on
 * @param {Function} props.onCommentAdded - Callback when comment is successfully added
 */
export default function CommentInput({ storyId, onCommentAdded }) {
    const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Require authentication
        if (!isAuthenticated) {
            loginWithRedirect();
            return;
        }

        // Validate content
        const trimmedContent = content.trim();
        if (!trimmedContent) {
            setError("Comment cannot be empty");
            return;
        }

        if (trimmedContent.length > 500) {
            setError("Comment must be 500 characters or less");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await commentService.createComment(
                getAccessTokenSilently,
                storyId,
                trimmedContent
            );

            if (response.success) {
                // Clear input
                setContent("");

                // Notify parent component
                if (onCommentAdded) {
                    onCommentAdded(response.comment);
                }
            }
        } catch (err) {
            console.error("Error creating comment:", err);
            setError(err.message || "Failed to post comment");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        // Submit on Ctrl+Enter or Cmd+Enter
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            handleSubmit(e);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="card-fun bg-gradient-to-br from-blue-100 to-purple-100 border-4 border-purple-300 rounded-2xl p-6 text-center">
                <p className="text-purple-700 mb-4 font-bold text-lg">🔐 Sign in to leave a comment!</p>
                <button
                    onClick={() => loginWithRedirect()}
                    className="btn-fun bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-bold shadow-lg"
                >
                    ✨ Sign In
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="card-fun bg-white border-4 border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="mb-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="💭 Write a comment... (Ctrl+Enter to submit)"
                    className="w-full bg-gradient-to-br from-purple-50 to-pink-50 border-3 border-purple-200 rounded-xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-purple-500 resize-none font-medium text-lg"
                    rows={3}
                    maxLength={500}
                    disabled={loading}
                />
                <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-purple-600 font-bold">
                        {content.length}/500 characters
                    </span>
                    {error && <span className="text-sm text-red-600 font-bold">❌ {error}</span>}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="btn-fun flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-bold shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Posting...</span>
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            <span>💬 Post Comment</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
