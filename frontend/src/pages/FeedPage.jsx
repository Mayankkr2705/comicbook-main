import { useState, useEffect, useCallback } from "react";
import { storyService } from "../services/storyService";
import StoryCard from "../components/StoryCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { Loader2 } from "lucide-react";

/**
 * FeedPage component displays a feed of public stories with infinite scroll
 * @param {Object} props
 * @param {Function} props.onStoryClick - Callback when a story card is clicked
 */
export default function FeedPage({ onStoryClick }) {
    const [stories, setStories] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const ITEMS_PER_PAGE = 10;

    // Fetch stories for a specific page
    const fetchStories = useCallback(async (pageNum) => {
        try {
            setLoading(true);
            setError(null);

            const response = await storyService.getPublicStories(pageNum, ITEMS_PER_PAGE);

            // Handle different response formats from backend
            const newStories = response.stories || response.data || [];
            const total = response.total || response.totalCount || 0;

            if (pageNum === 1) {
                setStories(newStories);
            } else {
                setStories((prev) => [...prev, ...newStories]);
            }

            // Check if there are more pages
            const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
            setHasMore(pageNum < totalPages);

        } catch (err) {
            console.error("Error fetching stories:", err);
            setError(err.message || "Failed to load stories");
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    }, []);

    // Load initial stories
    useEffect(() => {
        fetchStories(1);
    }, [fetchStories]);

    // Load more stories when scrolling
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchStories(nextPage);
        }
    }, [page, loading, hasMore, fetchStories]);

    // Infinite scroll sentinel
    const sentinelRef = useInfiniteScroll(loadMore, hasMore, loading);

    // Handle story card click
    const handleStoryClick = (storyId) => {
        if (onStoryClick) {
            onStoryClick(storyId);
        }
    };

    // Initial loading state
    if (initialLoad) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading stories...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && stories.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-white mb-2">
                        Oops! Something went wrong
                    </h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setPage(1);
                            fetchStories(1);
                        }}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // Empty state
    if (stories.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">📚</div>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        No Stories Yet
                    </h2>
                    <p className="text-gray-400">
                        Be the first to create and share a comic strip!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Stories Grid */}
            <div className="space-y-6">
                {stories.map((story, index) => (
                    <StoryCard
                        key={story._id || index}
                        story={story}
                        onClick={() => handleStoryClick(story._id)}
                    />
                ))}
            </div>

            {/* Loading more indicator */}
            {loading && stories.length > 0 && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}

            {/* Infinite scroll sentinel */}
            {hasMore && !loading && (
                <div ref={sentinelRef} className="h-20 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">Scroll for more...</p>
                </div>
            )}

            {/* End of feed message */}
            {!hasMore && stories.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">You've reached the end! 🎉</p>
                </div>
            )}

            {/* Error toast for pagination errors */}
            {error && stories.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
                    <p className="font-medium">Failed to load more stories</p>
                    <button
                        onClick={() => {
                            setError(null);
                            loadMore();
                        }}
                        className="text-sm underline mt-1"
                    >
                        Retry
                    </button>
                </div>
            )}
        </div>
    );
}
