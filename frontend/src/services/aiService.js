const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const aiService = {
  /**
   * Test the AI API connection
   * @returns {Promise<Object>} Test response
   */
  testConnection: async () => {
    const response = await fetch(`${API_URL}/ai/test`);
    if (!response.ok) {
      throw new Error("Failed to connect to AI API");
    }
    return response.json();
  },

  /**
   * Generate comic images using AI
   * @param {Function} getAccessToken - Function to get Auth0 access token
   * @param {string} prompt - Text prompt for comic generation
   * @param {string} provider - AI provider (uses 'openrouter')
   * @param {number} panels - Number of panels to generate (1-6)
   * @returns {Promise<Object>} Generated images data with array of image URLs
   */
  generateComicImage: async (
    getAccessToken,
    prompt,
    provider = "openrouter",
    panels = 4
  ) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/ai/generate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, provider, panels }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate image");
    }

    return response.json();
  },

  /**
   * Generate AI story text
   * @param {Function} getAccessToken - Function to get Auth0 access token
   * @param {string} prompt - Text prompt for story generation
   * @param {number} maxWords - Maximum words for the story (50-500, default 250)
   * @returns {Promise<Object>} Generated story data
   */
  generateStoryText: async (
    getAccessToken,
    prompt,
    maxWords = 250
  ) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/ai/generate-story`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, maxWords }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate story");
    }

    return response.json();
  },
};
