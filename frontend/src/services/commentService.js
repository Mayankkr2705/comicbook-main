const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const commentService = {
  /**
   * Get all comments for a story
   * @param {string} storyId - Story ID
   * @returns {Promise<Object>} Comments array
   */
  getComments: async (storyId) => {
    const response = await fetch(`${API_URL}/stories/${storyId}/comments`);
    if (!response.ok) {
      throw new Error("Failed to fetch comments");
    }
    return response.json();
  },

  /**
   * Create a new comment on a story
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} storyId - Story ID
   * @param {string} content - Comment content
   * @returns {Promise<Object>} Created comment
   */
  createComment: async (getAccessToken, storyId, content) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/${storyId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create comment");
    }
    return response.json();
  },

  /**
   * Delete a comment
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {string} storyId - Story ID
   * @param {string} commentId - Comment ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  deleteComment: async (getAccessToken, storyId, commentId) => {
    const token = await getAccessToken();
    const response = await fetch(
      `${API_URL}/stories/${storyId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete comment");
    }
    return response.json();
  },
};
