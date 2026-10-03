const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

export const userService = {
  /**
   * Get current authenticated user's profile
  * @param {Function} getAccessToken - Function to get the local JWT
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async (getAccessToken) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user profile");
    }
    return response.json();
  },

  /**
   * Update user profile
  * @param {Function} getAccessToken - Function to get the local JWT
   * @param {Object} profileData - Profile data to update (username, email)
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (getAccessToken, profileData) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update profile");
    }
    return response.json();
  },

  /**
   * Get user's stories (both public and private)
  * @param {Function} getAccessToken - Function to get the local JWT
   * @returns {Promise<Object>} User's stories
   */
  getUserStories: async (getAccessToken) => {
    const token = await getAccessToken();
    const response = await fetch(`${API_URL}/stories/my-stories`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch user stories");
    }
    return response.json();
  },
};
