import { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { storyService } from "../services/storyService";

/**
 * VoteButtons component displays upvote and downvote buttons with counts
 * @param {Object} props
 * @param {string} props.storyId - Story ID
 * @param {number} props.initialUpvotes - Initial upvote count
 * @param {number} props.initialDownvotes - Initial downvote count
 * @param {string|null} props.initialUserVote - User's current vote ('upvote', 'downvote', or null)
 * @param {Function} props.onVoteChange - Optional callback when vote changes
 */
export default function VoteButtons({
  storyId,
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  onVoteChange,
}) {
  const { isAuthenticated, getAccessToken } = useAuth();

  // Local state for optimistic updates
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle vote action
  const handleVote = async (voteType) => {
    // Require authentication
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("auth:open"));
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      // Calculate optimistic state
      let newUpvotes = upvotes;
      let newDownvotes = downvotes;
      let newUserVote = voteType;

      // If clicking the same vote type, remove the vote
      if (userVote === voteType) {
        newUserVote = null;
        if (voteType === "upvote") {
          newUpvotes -= 1;
        } else {
          newDownvotes -= 1;
        }
      } else {
        // Changing vote or adding new vote
        if (userVote === "upvote") {
          newUpvotes -= 1;
        } else if (userVote === "downvote") {
          newDownvotes -= 1;
        }

        if (voteType === "upvote") {
          newUpvotes += 1;
        } else {
          newDownvotes += 1;
        }
      }

      // Apply optimistic update
      setUpvotes(newUpvotes);
      setDownvotes(newDownvotes);
      setUserVote(newUserVote);

      // Make API call
      let response;
      if (userVote === voteType) {
        // Remove vote
        response = await storyService.removeVote(
          getAccessToken,
          storyId
        );
      } else {
        // Add or change vote
        response = await storyService.voteStory(
          getAccessToken,
          storyId,
          voteType
        );
      }

      // Update with actual server response
      if (response.success) {
        setUpvotes(response.upvotes);
        setDownvotes(response.downvotes);
        setUserVote(response.userVote);

        // Notify parent component
        if (onVoteChange) {
          onVoteChange({
            upvotes: response.upvotes,
            downvotes: response.downvotes,
            userVote: response.userVote,
          });
        }
      }
    } catch (err) {
      console.error("Error voting:", err);
      setError(err.message || "Failed to vote");

      // Revert optimistic update on error
      setUpvotes(initialUpvotes);
      setDownvotes(initialDownvotes);
      setUserVote(initialUserVote);

      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Upvote Button */}
      <button
        onClick={() => handleVote("upvote")}
        disabled={loading}
        className={`flex items-center gap-2 transition-all ${
          userVote === "upvote"
            ? "text-green-500"
            : "text-purple-500 hover:text-green-400"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label="Upvote"
      >
        <ArrowUp
          className={`w-8 h-8 ${userVote === "upvote" ? "fill-green-500" : ""}`}
        />
        <span className="text-xl font-medium text-purple-900">{upvotes}</span>
      </button>

      {/* Downvote Button */}
      <button
        onClick={() => handleVote("downvote")}
        disabled={loading}
        className={`flex items-center gap-2 transition-all ${
          userVote === "downvote"
            ? "text-red-500"
            : "text-purple-500 hover:text-red-400"
        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        aria-label="Downvote"
      >
        <ArrowDown
          className={`w-8 h-8 ${userVote === "downvote" ? "fill-red-500" : ""}`}
        />
        <span className="text-xl font-medium text-purple-900">{downvotes}</span>
      </button>

      {/* Error Message */}
      {error && <span className="text-xs text-pink-500 ml-2">{error}</span>}
    </div>
  );
}
