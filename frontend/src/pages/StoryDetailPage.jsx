import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { ArrowLeft, User, Clock, Loader2, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { storyService } from "../services/storyService";
import VoteButtons from "../components/VoteButtons";
import CommentSection from "../components/CommentSection";
import TextToSpeech from "../components/TextToSpeech";

/**
 * StoryDetailPage component displays full story with all panels and interactions
 * @param {Object} props
 * @param {string} props.storyId - Story ID from route parameter
 * @param {Function} props.onBack - Callback to navigate back
 */
export default function StoryDetailPage({ storyId, onBack }) {
    const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessDenied, setAccessDenied] = useState(false);
    const [currentPanelIndex, setCurrentPanelIndex] = useState(0);

    // Fetch story details
    useEffect(() => {
        const fetchStory = async () => {
            try {
                setLoading(true);
                setError(null);
                setAccessDenied(false);

                const getToken = isAuthenticated ? getAccessTokenSilently : null;
                const response = await storyService.getStoryById(storyId, getToken);

                if (response.success) {
                    setStory(response.story);
                }
            } catch (err) {
                console.error("Error fetching story:", err);

                // Check if it's an access denied error
                if (err.message.includes("Access denied") || err.message.includes("403")) {
                    setAccessDenied(true);
                } else {
                    setError(err.message || "Failed to load story");
                }
            } finally {
                setLoading(false);
            }
        };

        if (storyId) {
            fetchStory();
        }
    }, [storyId, isAuthenticated, getAccessTokenSilently]);

    // Handle vote change
    const handleVoteChange = (voteData) => {
        if (story) {
            setStory({
                ...story,
                upvotes: voteData.upvotes,
                downvotes: voteData.downvotes,
                userVote: voteData.userVote,
            });
        }
    };

    // Format timestamp
    const formatTimestamp = (date) => {
        const storyDate = new Date(date);
        return storyDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Check if current user is the author
    const isAuthor = () => {
        if (!isAuthenticated || !user || !story) return false;
        return story.author?._id === user.sub || story.author?.id === user.sub;
    };

    // Carousel navigation handlers
    const handlePrevPanel = () => {
        setCurrentPanelIndex((prev) => 
            prev === 0 ? (story.images.length - 1) : prev - 1
        );
    };

    const handleNextPanel = () => {
        setCurrentPanelIndex((prev) => 
            prev === story.images.length - 1 ? 0 : prev + 1
        );
    };

    const handleKeyboardNavigation = (e) => {
        if (e.key === "ArrowLeft") {
            handlePrevPanel();
        } else if (e.key === "ArrowRight") {
            handleNextPanel();
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading story...</p>
                </div>
            </div>
        );
    }

    // Access denied state
    if (accessDenied) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        Access Denied
                    </h2>
                    <p className="text-gray-400 mb-6">
                        This story is private and you don't have permission to view it.
                    </p>
                    <button
                        onClick={onBack}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={onBack}
                            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No story found
    if (!story) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Story not found</p>
                    <button
                        onClick={onBack}
                        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Back Button */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Feed</span>
            </button>

            {/* Story Header */}
            <div className="card-fun bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 rounded-3xl p-8 mb-6 shadow-xl">
                {/* Author Info */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center border-4 border-white shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <p className="text-purple-900 font-bold text-xl">
                            {story.author?.username || story.author?.email || "Anonymous"}
                        </p>
                        <div className="flex items-center gap-2 text-purple-600 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimestamp(story.createdAt)}</span>
                        </div>
                    </div>
                    {isAuthor() && (
                        <span className="ml-auto px-4 py-2 bg-blue-400 border-3 border-blue-600 text-white text-sm rounded-full font-bold shadow-lg">
                            ⭐ Your Story
                        </span>
                    )}
                    {story.visibility === "private" && (
                        <span className="ml-auto px-4 py-2 bg-red-400 border-3 border-red-600 text-white text-sm rounded-full flex items-center gap-2 font-bold shadow-lg">
                            <Lock className="w-4 h-4" />
                            🔒 Private
                        </span>
                    )}
                </div>

                {/* Title and Description */}
                <h1 className="text-4xl font-bold text-purple-900 mb-3">{story.title}</h1>
                {story.description && (
                    <p className="text-purple-700 text-xl font-medium">{story.description}</p>
                )}
            </div>

            {/* Story Content (if exists) */}
            {story.content && (
                <div className="card-fun bg-gradient-to-br from-yellow-50 to-pink-50 rounded-3xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h2 className="text-3xl font-bold text-purple-700">📖 Story Time!</h2>
                        <TextToSpeech text={story.content} />
                    </div>
                    <div className="bg-white rounded-2xl p-8 border-4 border-purple-200 shadow-inner">
                        <p className="story-text text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                            {story.content}
                        </p>
                    </div>
                </div>
            )}

            {/* Comic Panels Carousel */}
            {story.images && story.images.length > 0 && (
                <div className="card-fun bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 mb-6 shadow-xl">
                    <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                        🎨 Comic Panels
                    </h2>
                    {story.images && story.images.length > 0 ? (
                    <div 
                        className="relative"
                        tabIndex={0}
                        onKeyDown={handleKeyboardNavigation}
                    >
                        {/* Main Image Display */}
                        <div className="bg-white rounded-2xl overflow-hidden border-4 border-purple-300 shadow-lg">
                            <img
                                src={story.images[currentPanelIndex].url}
                                alt={`Panel ${currentPanelIndex + 1}`}
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Navigation Buttons */}
                        {story.images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevPanel}
                                    className="btn-fun absolute left-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 shadow-xl border-3 border-white"
                                    aria-label="Previous panel"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={handleNextPanel}
                                    className="btn-fun absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 shadow-xl border-3 border-white"
                                    aria-label="Next panel"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Panel Counter and Dots */}
                        <div className="mt-6 flex flex-col items-center gap-4">
                            <div className="text-center bg-purple-200 px-6 py-3 rounded-full border-3 border-purple-400">
                                <span className="text-purple-900 text-lg font-bold">
                                    📖 Panel {currentPanelIndex + 1} of {story.images.length}
                                </span>
                            </div>
                            
                            {/* Dot Indicators */}
                            {story.images.length > 1 && (
                                <div className="flex gap-3">
                                    {story.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPanelIndex(index)}
                                            className={`transition-all border-2 ${
                                                index === currentPanelIndex
                                                    ? "w-12 h-4 bg-gradient-to-r from-purple-500 to-pink-500 border-purple-600"
                                                    : "w-4 h-4 bg-purple-200 border-purple-400 hover:bg-purple-300"
                                            } rounded-full shadow-md`}
                                            aria-label={`Go to panel ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">No images available</p>
                )}
                </div>
            )}

            {/* Engagement Section */}
            <div className="card-fun bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-8 mb-6 shadow-xl">
                <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                    👍 What do you think?
                </h2>
                <VoteButtons
                    storyId={story._id}
                    initialUpvotes={story.upvotes || 0}
                    initialDownvotes={story.downvotes || 0}
                    initialUserVote={story.userVote || null}
                    onVoteChange={handleVoteChange}
                />
            </div>

            {/* Comments Section */}
            <div className="card-fun bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-2">
                    💬 Comments
                </h2>
                <CommentSection storyId={story._id} />
            </div>
        </div>
    );
}
