const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const storyService = {
  /**
   * Get all public stories with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Public stories with pagination metadata
   */
  getPublicStories: async (page = 1, limit = 10) => {
    const response = await fetch(
      `${API_URL}/stories/public?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch public stories");
    }
    return response.json();
  },

  /**
   * Get a single story by ID
   * @param {string} id - Story ID
  * @param {Function} getAccessToken - Optional function to get the local JWT for private stories
   * @returns {Promise<Object>} Story data
   */
  getStoryById: async (id, getAccessToken = null) => {
    const headers = {};
    if (getAccessToken) {
      const token = await getAccessToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/stories/${id}`, { headers });
    if (!response.ok) {
      throw new Error("Failed to fetch story");
    }
    return response.json();
  },

  /**
   * Get stories created by the authenticated user
  * @param {Function} getAccessToken - Function to get the local JWT
   * @returns {Promise<Object>} User's stories
   */
  getMyStories: async (getAccessToken) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/my-stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch your stories");
    }
    return response.json();
  },

  /**
   * Create a new story
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {Object} storyData - Story data { images: [{url: string}], visibility: 'public'|'private' }
   * @returns {Promise<Object>} Created story
   */
  createStory: async (getAccessToken, storyData) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storyData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create story");
    }
    return response.json();
  },

  /**
   * Update an existing story
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} id - Story ID
   * @param {Object} storyData - Updated story data
   * @returns {Promise<Object>} Updated story
   */
  updateStory: async (getAccessToken, id, storyData) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(storyData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update story");
    }
    return response.json();
  },

  /**
   * Delete a story
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} id - Story ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteStory: async (getAccessToken, id) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete story");
    }
    return response.json();
  },

  /**
   * Vote on a story (upvote or downvote)
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} id - Story ID
   * @param {string} voteType - 'upvote' or 'downvote'
   * @returns {Promise<Object>} Updated vote counts and user vote status
   */
  voteStory: async (getAccessToken, id, voteType) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${id}/vote`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ voteType }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to vote on story");
    }
    return response.json();
  },

  /**
   * Remove vote from a story
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} id - Story ID
   * @returns {Promise<Object>} Updated vote counts
   */
  removeVote: async (getAccessToken, id) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${id}/vote`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to remove vote");
    }
    return response.json();
  },

  /**
   * Update story visibility
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} id - Story ID
   * @param {string} visibility - 'public' or 'private'
   * @returns {Promise<Object>} Updated story
   */
  updateVisibility: async (getAccessToken, id, visibility) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${id}/visibility`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ visibility }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update visibility");
    }
    return response.json();
  },
};
