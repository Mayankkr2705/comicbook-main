import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2, BookOpen, Sparkles } from "lucide-react";
import { aiService } from "../services/aiService";
import { storyService } from "../services/storyService";
import TextToSpeech from "./TextToSpeech";

export default function StoryGenerator() {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();

  // Form state
  const [prompt, setPrompt] = useState("");
  const [maxWords, setMaxWords] = useState(250);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Generation state
  const [generatedStory, setGeneratedStory] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle generate story
  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    // Validate prompt
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setSuccess(false);

      const response = await aiService.generateStoryText(
        getAccessTokenSilently,
        prompt.trim(),
        maxWords
      );

      if (response.success && response.story) {
        setGeneratedStory(response.story);
        setWordCount(response.wordCount || 0);
        
        // Auto-generate title from prompt if not set
        if (!title.trim()) {
          const autoTitle = prompt.trim().substring(0, 50) + (prompt.length > 50 ? "..." : "");
          setTitle(autoTitle);
        }
      } else {
        throw new Error("Failed to generate story");
      }
    } catch (err) {
      console.error("Error generating story:", err);
      setError(err.message || "Failed to generate story");
    } finally {
      setGenerating(false);
    }
  };

  // Handle publish story
  const handlePublish = async () => {
    if (!generatedStory) {
      setError("No story to publish");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for your story");
      return;
    }

    try {
      setPublishing(true);
      setError(null);

      await storyService.createStory(getAccessTokenSilently, {
        title: title.trim(),
        content: generatedStory,
        description: `AI-generated story (${wordCount} words)`,
        images: [], // No images for text-only stories
        visibility,
      });

      setSuccess(true);
      
      // Reset form after successful publish
      setTimeout(() => {
        setPrompt("");
        setTitle("");
        setGeneratedStory("");
        setWordCount(0);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Error publishing story:", err);
      setError(err.message || "Failed to publish story");
    } finally {
      setPublishing(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
        <BookOpen className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-white text-2xl font-bold mb-2">
          AI Story Generator
        </h3>
        <p className="text-gray-400 mb-6">
          Sign in to generate creative stories using AI
        </p>
        <button
          onClick={() => loginWithRedirect()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="card-fun bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 rounded-3xl p-8">
      <h3 className="text-purple-700 text-4xl font-bold mb-6 flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-yellow-400" />
        ✨ AI Story Magic! ✨
      </h3>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="space-y-4 mb-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-purple-900 font-bold mb-3 text-lg flex items-center gap-2">
            📝 Story Prompt *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your amazing story... (e.g., 'A brave knight discovers a magical forest full of friendly dragons! 🐉✨')"
            className="w-full bg-white border-4 border-purple-300 rounded-2xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-pink-400 resize-none shadow-inner font-medium"
            rows={3}
            maxLength={500}
            disabled={generating}
          />
          <p className="text-sm text-purple-600 font-bold mt-2">{prompt.length}/500 characters</p>
        </div>

        {/* Max Words Slider */}
        <div>
          <label className="block text-white font-medium mb-2">
            Maximum Words: {maxWords}
          </label>
          <input
            type="range"
            min="50"
            max="250"
            step="25"
            value={maxWords}
            onChange={(e) => setMaxWords(parseInt(e.target.value))}
            className="w-full"
            disabled={generating}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>50 words</span>
            <span>250 words</span>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="submit"
          disabled={generating || !prompt.trim()}
          className="btn-fun w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-400 via-blue-400 to-purple-500 hover:from-green-500 hover:via-blue-500 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-xl font-bold shadow-xl"
        >
          {generating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>✨ Creating Magic...</span>
            </>
          ) : (
            <>
              <BookOpen className="w-6 h-6" />
              <span>🎨 CREATE STORY!</span>
            </>
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-4 border-red-400 text-red-700 rounded-2xl p-5 mb-6 font-bold text-lg">
          ❌ Oops! {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-100 border-4 border-green-400 text-green-700 rounded-2xl p-5 mb-6 font-bold text-lg animate-bounce">
          🎉 Yay! Story published successfully!
        </div>
      )}

      {/* Preview Area */}
      {generatedStory && (
        <div className="border-t-4 border-purple-300 pt-8 space-y-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h4 className="text-purple-700 text-3xl font-bold">📚 Your Story!</h4>
              <span className="bg-yellow-200 text-purple-900 px-4 py-2 rounded-full text-sm font-bold border-3 border-yellow-400">{wordCount} words</span>
            </div>
            <TextToSpeech text={generatedStory} />
          </div>

          {/* Story Text */}
          <div className="bg-white rounded-2xl p-8 border-4 border-pink-300 shadow-inner">
            <p className="story-text text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {generatedStory}
            </p>
          </div>

          {/* Publish Form */}
          <div className="space-y-6 pt-6 bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-4 border-blue-300">
            <h4 className="text-purple-700 text-2xl font-bold flex items-center gap-2">
              📤 Share Your Story!
            </h4>

            {/* Title Input */}
            <div>
              <label className="block text-purple-900 font-bold mb-2 text-lg">
                🏷️ Story Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your story an awesome title..."
                className="w-full bg-white border-4 border-purple-300 rounded-2xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-pink-400 font-medium"
                maxLength={200}
                disabled={publishing}
              />
            </div>

            {/* Visibility Selection */}
            <div>
              <label className="block text-purple-900 font-bold mb-3 text-lg">
                👀 Who can see it?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-xl border-3 border-purple-300 hover:border-purple-500 transition-all">
                  <input
                    type="radio"
                    value="public"
                    checked={visibility === "public"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                    disabled={publishing}
                  />
                  <span className="text-purple-900 font-bold">🌍 Public</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-xl border-3 border-purple-300 hover:border-purple-500 transition-all">
                  <input
                    type="radio"
                    value="private"
                    checked={visibility === "private"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                    disabled={publishing}
                  />
                  <span className="text-purple-900 font-bold">🔒 Private</span>
                </label>
              </div>
            </div>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={publishing || !title.trim()}
              className="btn-fun w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 hover:from-pink-500 hover:via-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white text-xl font-bold shadow-xl"
            >
              {publishing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>📤 Publishing...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-6 h-6" />
                  <span>🚀 PUBLISH STORY!</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

