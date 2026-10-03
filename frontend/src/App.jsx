import React from "react";
import { useAuth } from "./contexts/AuthContext";
import AppLayout from "./components/AppLayout";
import FeedPage from "./pages/FeedPage";
import StoryDetailPage from "./pages/StoryDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ComicGenerator from "./components/ComicGenerator";
import StoryGenerator from "./components/StoryGenerator";
import AuthModal from "./components/AuthModal";
import { AlertCircle } from "lucide-react";

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = React.useState("feed");
  const [selectedStoryId, setSelectedStoryId] = React.useState(null);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authTab, setAuthTab] = React.useState("login");

  React.useEffect(() => {
    const openAuth = () => {
      setAuthTab("login");
      setShowAuthModal(true);
    };
    window.addEventListener("auth:open", openAuth);
    return () => window.removeEventListener("auth:open", openAuth);
  }, []);

  const handleNavigate = (viewId) => {
    if (viewId === "login") {
      setAuthTab("login");
      setShowAuthModal(true);
      return;
    }
    if (viewId !== "story-detail") setSelectedStoryId(null);
    setView(viewId);
  };

  const handleViewStory = (storyId) => {
    setSelectedStoryId(storyId);
    setView("story-detail");
  };

  const handleBackFromStory = () => {
    setSelectedStoryId(null);
    setView("feed");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin h-16 w-16 border-t-4 border-b-4 border-purple-500 rounded-full"></div>
          <p className="mt-4 text-gray-600 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  const requireAuth = (content) => {
    if (!isAuthenticated) {
      return (
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white border-4 border-purple-300 p-8 text-center rounded-2xl shadow-xl">
            <h2 className="text-2xl font-black text-purple-700 mb-4">Sign In Required</h2>
            <p className="text-gray-500 mb-6">You need to sign in to access this feature.</p>
            <button
              onClick={() => { setAuthTab("login"); setShowAuthModal(true); }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>
      );
    }
    return content;
  };

  const renderContent = () => {
    if (view === "story-detail" && selectedStoryId) {
      return <StoryDetailPage storyId={selectedStoryId} onBack={handleBackFromStory} />;
    }
    if (view === "feed") return <FeedPage onStoryClick={handleViewStory} />;
    if (view === "create") return requireAuth(<ComicGenerator />);
    if (view === "story-generator") return requireAuth(<StoryGenerator />);
    if (view === "profile") return requireAuth(<ProfilePage onStoryClick={handleViewStory} />);
    return <FeedPage onStoryClick={handleViewStory} />;
  };

  return (
    <>
      <AppLayout currentView={view} onNavigate={handleNavigate} onShowAuth={(tab) => { setAuthTab(tab); setShowAuthModal(true); }}>
        {renderContent()}
      </AppLayout>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} defaultTab={authTab} />}
    </>
  );
}

export default App;
