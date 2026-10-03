import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { aiService } from "../services/aiService";
import { storyService } from "../services/storyService";

export default function ComicGenerator() {
  const { isAuthenticated, getAccessTokenSilently, loginWithRedirect } = useAuth0();

  // Form state
  const [prompt, setPrompt] = useState("");
  const [panels, setPanels] = useState(4);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");

  // Generation state
  const [generatedImages, setGeneratedImages] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle generate comic
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

      const response = await aiService.generateComicImage(
        getAccessTokenSilently,
        prompt.trim(),
        "openrouter",
        panels
      );

      if (response.success && response.images) {
        setGeneratedImages(response.images);
      } else {
        throw new Error("Failed to generate images");
      }
    } catch (err) {
      console.error("Error generating comic:", err);
      setError(err.message || "Failed to generate comic");
    } finally {
      setGenerating(false);
    }
  };

  // Handle publish story
  const handlePublish = async () => {
    if (!isAuthenticated) {
      loginWithRedirect();
      return;
    }

    // Validate
    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (generatedImages.length === 0) {
      setError("Please generate a comic first");
      return;
    }

    try {
      setPublishing(true);
      setError(null);

      const storyData = {
        title: title.trim(),
        description: description.trim() || undefined,
        images: generatedImages,
        visibility,
      };

      const response = await storyService.createStory(
        getAccessTokenSilently,
        storyData
      );

      if (response.success) {
        setSuccess(true);
        // Reset form
        setPrompt("");
        setTitle("");
        setDescription("");
        setGeneratedImages([]);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error publishing story:", err);
      setError(err.message || "Failed to publish story");
    } finally {
      setPublishing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="card-fun bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-12 text-center shadow-xl">
        <div className="text-7xl mb-6">🎨</div>
        <h3 className="text-purple-900 text-3xl font-bold mb-4">Create Amazing Comics!</h3>
        <p className="text-purple-700 mb-8 text-lg font-medium">Sign in to start creating AI-generated comics! ✨</p>
        <button
          onClick={() => loginWithRedirect()}
          className="btn-fun px-10 py-5 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white text-xl font-bold"
        >
          🚀 Sign In to Create!
        </button>
      </div>
    );
  }

  return (
    <div className="card-fun bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl">
      <h3 className="text-purple-700 text-4xl font-bold mb-8 flex items-center gap-3">
        <Sparkles className="w-10 h-10 text-yellow-400" />
        🎨 Create Comic Strip!
      </h3>

      {/* Generation Form */}
      <form onSubmit={handleGenerate} className="space-y-4 mb-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-purple-900 font-bold mb-3 text-lg flex items-center gap-2">
            🖊️ Comic Prompt *
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your amazing comic... (e.g., 'A super cat and magic dog save the candy kingdom! 🍬🦸')"
            className="w-full bg-white border-4 border-purple-300 rounded-2xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-pink-400 resize-none shadow-inner font-medium"
            rows={3}
            maxLength={500}
            disabled={generating}
          />
          <p className="text-sm text-purple-600 font-bold mt-2">{prompt.length}/500 characters</p>
        </div>

        {/* Panel Count */}
        <div>
          <label className="block text-purple-900 font-bold mb-3 text-lg">
            📊 Number of Panels: <span className="text-pink-600">{panels}</span>
          </label>
          <input
            type="range"
            min="1"
            max="6"
            value={panels}
            onChange={(e) => setPanels(parseInt(e.target.value))}
            className="w-full accent-purple-500"
            disabled={generating}
            style={{height: '12px'}}
          />
          <div className="flex justify-between text-sm text-purple-700 font-bold mt-2">
            <span>1️⃣ panel</span>
            <span>6️⃣ panels</span>
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
              <ImageIcon className="w-6 h-6" />
              <span>🎨 GENERATE COMIC!</span>
            </>
          )}
        </button>
      </form>

      {/* Preview Area */}
      {generatedImages.length > 0 && (
        <div className="border-t-4 border-purple-300 pt-8 space-y-6">
          <h4 className="text-purple-700 text-3xl font-bold flex items-center gap-2">🎨 Your Comic!</h4>

          {/* Generated Images Grid */}
          <div className="grid grid-cols-2 gap-6">
            {generatedImages.map((image, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden border-4 border-purple-300 shadow-lg">
                <img
                  src={image.url}
                  alt={`Panel ${index + 1}`}
                  className="w-full h-auto"
                />
                <div className="p-2 text-center bg-purple-100">
                  <span className="text-purple-900 font-bold">Panel {index + 1}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Publish Form */}
          <div className="space-y-6 bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl border-4 border-pink-300 mt-6">
            <h4 className="text-purple-700 text-2xl font-bold flex items-center gap-2">
              📤 Publish Your Comic!
            </h4>
            
            <div>
              <label className="block text-purple-900 font-bold mb-2 text-lg">
                🏷️ Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your comic an awesome title..."
                className="w-full bg-white border-4 border-purple-300 rounded-2xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-pink-400 font-medium"
                maxLength={100}
                disabled={publishing}
              />
            </div>

            <div>
              <label className="block text-purple-900 font-bold mb-2 text-lg">
                📝 Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your comic..."
                className="w-full bg-white border-4 border-purple-300 rounded-2xl px-5 py-4 text-purple-900 placeholder-purple-400 focus:outline-none focus:border-pink-400 resize-none font-medium"
                rows={2}
                maxLength={500}
                disabled={publishing}
              />
            </div>

            <div>
              <label className="block text-purple-900 font-bold mb-3 text-lg">
                👀 Who can see it?
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-xl border-3 border-purple-300 hover:border-purple-500 transition-all flex-1">
                  <input
                    type="radio"
                    value="public"
                    checked={visibility === "public"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-5 h-5 text-purple-600"
                    disabled={publishing}
                  />
                  <span className="text-purple-900 font-bold">🌍 Public</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer bg-white px-5 py-3 rounded-xl border-3 border-purple-300 hover:border-purple-500 transition-all flex-1">
                  <input
                    type="radio"
                    value="private"
                    checked={visibility === "private"}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-5 h-5 text-purple-600"
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
                <span>🚀 PUBLISH COMIC!</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-100 border-4 border-red-400 rounded-2xl p-5">
          <p className="text-red-700 font-bold text-lg">❌ Oops! {error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mt-6 bg-green-100 border-4 border-green-400 rounded-2xl p-5 animate-bounce">
          <p className="text-green-700 font-bold text-lg">🎉 Yay! Comic published successfully!</p>
        </div>
      )}
    </div>
  );
}
