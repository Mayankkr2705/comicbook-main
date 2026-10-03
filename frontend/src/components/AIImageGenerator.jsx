import { useState } from "react";
import { useAuthService, aiService, storyService } from "../services";

const AIImageGenerator = () => {
  const { getAccessToken } = useAuthService();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    setImageData(null);
    setSaved(false);

    try {
      const data = await aiService.generateComicImage(getAccessToken);
      setImageData(data);
    } catch (err) {
      setError(err.message);
      console.error("Image generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStory = async (visibility = "public") => {
    if (!imageData) return;

    setSaving(true);
    setError(null);

    try {
      await storyService.createStory(getAccessToken, {
        images: [{ url: imageData.imageUrl }],
        visibility,
      });
      setSaved(true);
    } catch (err) {
      setError(err.message);
      console.error("Failed to save story:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-zinc-900 border border-zinc-800">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          AI Comic Generator
        </h2>
        <p className="text-gray-400">
          Generate unique comic strips using AI - watch a cat and dog battle
          over a toy!
        </p>
      </div>

      <button
        onClick={handleGenerateImage}
        disabled={loading}
        className={`w-full sm:w-auto px-8 py-3 text-lg font-semibold transition-all duration-200 ${
          loading
            ? "bg-zinc-700 cursor-not-allowed text-gray-500"
            : "bg-white hover:bg-gray-200 text-black"
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          "Generate Comic Image"
        )}
      </button>

      {loading && (
        <div className="mt-4 p-4 bg-zinc-800 border-l-4 border-white">
          <p className="text-white flex items-center gap-2">
            <span>
              Creating your masterpiece... This may take 5-15 seconds.
            </span>
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-zinc-800 border-l-4 border-gray-500">
          <p className="text-gray-300">
            <strong className="font-semibold">Error:</strong> {error}
          </p>
        </div>
      )}

      {imageData && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-zinc-800 border-l-4 border-white">
            <p className="text-white font-semibold flex items-center gap-2">
              Success! Image generated and uploaded to Cloudinary
            </p>
          </div>

          <div className="bg-zinc-800 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-300 mb-1">
                Image URL:
              </p>
              <a
                href={imageData.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white text-sm break-all underline"
              >
                {imageData.imageUrl}
              </a>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-300">
                Cloudinary ID:{" "}
                <span className="font-normal text-gray-400">
                  {imageData.cloudinaryPublicId}
                </span>
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden border border-zinc-800">
            <img
              src={imageData.imageUrl}
              alt="Generated comic strip"
              className="w-full h-auto"
            />
          </div>

          {!saved ? (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => handleSaveStory("public")}
                disabled={saving}
                className={`flex-1 sm:flex-none px-6 py-3 font-semibold transition-all ${
                  saving
                    ? "bg-zinc-700 cursor-not-allowed text-gray-500"
                    : "bg-white hover:bg-gray-200 text-black"
                }`}
              >
                {saving ? "Saving..." : "Save as Public"}
              </button>
              <button
                onClick={() => handleSaveStory("private")}
                disabled={saving}
                className={`flex-1 sm:flex-none px-6 py-3 font-semibold transition-all ${
                  saving
                    ? "bg-zinc-700 cursor-not-allowed text-gray-500"
                    : "bg-zinc-700 hover:bg-zinc-600 text-white"
                }`}
              >
                {saving ? "Saving..." : "Save as Private"}
              </button>
            </div>
          ) : (
            <div className="p-4 bg-zinc-800 border-l-4 border-white">
              <p className="text-white font-semibold">
                Story saved successfully!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIImageGenerator;
