import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import AppLayout from "./components/AppLayout";
import FeedPage from "./pages/FeedPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ComicGenerator from "./components/ComicGenerator";
import StoryGenerator from "./components/StoryGenerator";
import LoginButton from "./components/LoginButton";
import { AlertCircle } from "lucide-react";

function App() {
  const { isAuthenticated, isLoading, loginWithRedirect, error: authError } = useAuth0();
  const [view, setView] = React.useState("feed");
  const [selectedStoryId, setSelectedStoryId] = React.useState(null);
  const [authRetryCount, setAuthRetryCount] = React.useState(0);

  // Handle navigation
  const handleNavigate = (viewId) => {
    if (viewId === "login") {
      loginWithRedirect();
      return;
    }

    // Reset story selection when navigating away from detail
    if (viewId !== "story-detail") {
      setSelectedStoryId(null);
    }

    setView(viewId);
  };

  // Handle story click from feed or profile
  const handleViewStory = (storyId) => {
    setSelectedStoryId(storyId);
    setView("story-detail");
  };

  // Handle back navigation from story detail
  const handleBackFromStory = () => {
    setSelectedStoryId(null);
    setView("feed");
  };

  // Handle authentication retry
  const handleAuthRetry = () => {
    setAuthRetryCount(authRetryCount + 1);
    loginWithRedirect();
  };

  // Authentication error state
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-400 mb-6">
            {authError.message || "Failed to authenticate. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleAuthRetry}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Retry Login
            </button>
            <button
              onClick={() => setView("feed")}
              className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors font-medium"
            >
              Continue as Guest
            </button>
          </div>
          {authRetryCount > 0 && (
            <p className="text-gray-500 text-sm mt-4">
              Retry attempt: {authRetryCount}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin h-16 w-16 border-t-4 border-b-4 border-white"></div>
          <p className="mt-4 text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Render page content based on current view
  const renderContent = () => {
    // Story detail view
    if (view === "story-detail" && selectedStoryId) {
      return (
        <StoryDetailPage storyId={selectedStoryId} onBack={handleBackFromStory} />
      );
    }

    // Feed view
    if (view === "feed") {
      return <FeedPage onStoryClick={handleViewStory} />;
    }

    // Create view (Comic Generator)
    if (view === "create") {
      if (!isAuthenticated) {
        return (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-zinc-900 border border-zinc-800 p-8 text-center rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-400 mb-6">
                You need to sign in to create comic strips.
              </p>
              <LoginButton />
            </div>
          </div>
        );
      }
      return <ComicGenerator />;
    }

    // Story Generator view
    if (view === "story-generator") {
      if (!isAuthenticated) {
        return (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-zinc-900 border border-zinc-800 p-8 text-center rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-400 mb-6">
                You need to sign in to generate AI stories.
              </p>
              <LoginButton />
            </div>
          </div>
        );
      }
      return <StoryGenerator />;
    }

    // Profile view
    if (view === "profile") {
      if (!isAuthenticated) {
        return (
          <div className="max-w-md mx-auto mt-20">
            <div className="bg-zinc-900 border border-zinc-800 p-8 text-center rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-400 mb-6">
                You need to sign in to view your profile.
              </p>
              <LoginButton />
            </div>
          </div>
        );
      }
      return <ProfilePage onStoryClick={handleViewStory} />;
    }

    // Default to feed
    return <FeedPage onStoryClick={handleViewStory} />;
  };

  return (
    <AppLayout currentView={view} onNavigate={handleNavigate}>
      {renderContent()}
    </AppLayout>
  );
}

export default App;
