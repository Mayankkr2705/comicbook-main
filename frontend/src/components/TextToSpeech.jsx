import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

export default function TextToSpeech({ text }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);

    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when text changes
    if (isPlaying) {
      handleStop();
    }
  }, [text]);

  const handlePlay = () => {
    if (!text || !window.speechSynthesis) return;

    // If paused, resume
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Configure utterance
    utterance.rate = 1.0; // Speed (0.1 to 10)
    utterance.pitch = 1.0; // Pitch (0 to 2)
    utterance.volume = 1.0; // Volume (0 to 1)
    utterance.lang = 'en-US';

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsPlaying(false);
      setIsPaused(false);
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (window.speechSynthesis && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show controls if not supported
  }

  return (
    <div className="flex items-center gap-2">
      {!isPlaying && !isPaused ? (
        <button
          onClick={handlePlay}
          className="btn-fun flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white text-sm font-bold"
          title="Listen to story"
          aria-label="Listen to story"
        >
          <Volume2 className="w-5 h-5" />
          <span>🎧 LISTEN</span>
        </button>
      ) : isPaused ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className="btn-fun flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white text-sm font-bold"
            title="Resume"
            aria-label="Resume playback"
          >
            <Play className="w-5 h-5" />
            <span>▶️ RESUME</span>
          </button>
          <button
            onClick={handleStop}
            className="btn-fun flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white text-sm font-bold"
            title="Stop"
            aria-label="Stop playback"
          >
            <VolumeX className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePause}
            className="btn-fun flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-purple-900 text-sm font-bold animate-pulse"
            title="Pause"
            aria-label="Pause playback"
          >
            <Pause className="w-5 h-5" />
            <span>⏸️ PAUSE</span>
          </button>
          <button
            onClick={handleStop}
            className="btn-fun flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 text-white text-sm font-bold"
            title="Stop"
            aria-label="Stop playback"
          >
            <VolumeX className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-full border-2 border-purple-400">
            <span className="text-xs text-purple-900 font-bold">Playing</span>
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-1 h-4 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-1 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

