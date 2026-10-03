import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { User, Loader2, Settings } from "lucide-react";
import { userService } from "../services/userService";
import StoryGrid from "../components/StoryGrid";

/**
 * ProfilePage component displays user profile and their stories
 * @param {Object} props
 * @param {Function} props.onStoryClick - Callback when a story is clicked
 */
export default function ProfilePage({ onStoryClick }) {
  const { user, getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("stories");
  const [userProfile, setUserProfile] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile and stories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user stories
        const storiesResponse = await userService.getUserStories(
          getAccessToken
        );
        if (storiesResponse.success) {
          setStories(storiesResponse.stories || []);
        }

        // Try to fetch user profile (may not exist yet)
        try {
          const profileResponse = await userService.getCurrentUser(
            getAccessToken
          );
          if (profileResponse.success) {
            setUserProfile(profileResponse.user);
          }
        } catch {
          // Profile might not exist yet, use the authenticated user data.
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessToken]);

  // Handle story deleted
  const handleStoryDeleted = (storyId) => {
    setStories((prev) => prev.filter((s) => s._id !== storyId));
  };

  // Handle visibility changed
  const handleVisibilityChanged = (storyId, newVisibility) => {
    setStories((prev) =>
      prev.map((s) =>
        s._id === storyId ? { ...s, visibility: newVisibility } : s
      )
    );
  };

  // Get display name
  const displayName =
    userProfile?.username || user?.username || user?.email || "User";
  const displayEmail = userProfile?.email || user?.email || "";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center card-fun bg-gradient-to-br from-purple-100 to-pink-100 p-12 rounded-3xl">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-purple-900 text-xl font-bold">
            Loading your profile... ✨
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md card-fun bg-gradient-to-br from-red-100 to-pink-100 p-12 rounded-3xl">
          <div className="text-6xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-purple-900 mb-4">
            Oops! Something Went Wrong
          </h2>
          <p className="text-purple-700 mb-6 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-fun px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white font-bold text-lg"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get first letter for fallback avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="card-fun bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 rounded-3xl p-8 mb-8 shadow-xl">
        <div className="flex items-start gap-8 flex-wrap">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center flex-shrink-0 border-6 border-white shadow-2xl relative">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{ display: user?.picture ? "none" : "flex" }}
            >
              <span className="text-white text-5xl font-bold">
                {getInitials(displayName)}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-purple-900 mb-3">
              {displayName}
            </h1>
            <p className="text-purple-700 mb-6 text-lg font-medium">
              {displayEmail}
            </p>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white px-6 py-4 rounded-2xl border-4 border-purple-300 shadow-md">
                <span className="text-purple-900 font-bold text-3xl">
                  {stories.length}
                </span>
                <span className="text-purple-700 ml-2 font-bold text-lg">
                  {stories.length === 1 ? "📚 Story" : "📚 Stories"}
                </span>
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl border-4 border-green-300 shadow-md">
                <span className="text-green-800 font-bold text-3xl">
                  {stories.filter((s) => s.visibility === "public").length}
                </span>
                <span className="text-green-700 ml-2 font-bold text-lg">
                  🌍 Public
                </span>
              </div>
              <div className="bg-white px-6 py-4 rounded-2xl border-4 border-red-300 shadow-md">
                <span className="text-red-800 font-bold text-3xl">
                  {stories.filter((s) => s.visibility === "private").length}
                </span>
                <span className="text-red-700 ml-2 font-bold text-lg">
                  🔒 Private
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card-fun bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="flex border-b-4 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex-1 px-8 py-5 font-bold text-lg transition-all ${
              activeTab === "stories"
                ? "text-purple-900 border-b-4 border-purple-600 bg-white"
                : "text-purple-600 hover:text-purple-900 hover:bg-purple-100"
            }`}
          >
            📚 My Stories
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "stories" ? (
            <StoryGrid
              stories={stories}
              onStoryClick={onStoryClick}
              onStoryDeleted={handleStoryDeleted}
              onVisibilityChanged={handleVisibilityChanged}
            />
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-4 border-purple-200">
              <Settings className="w-20 h-20 text-purple-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-purple-900 mb-4">
                ⚙️ Settings Coming Soon!
              </h3>
              <p className="text-purple-700 text-lg font-medium">
                Profile editing and cool preferences will be available here
                soon! ✨
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
