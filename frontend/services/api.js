import axios from 'axios';

// Backend URL (configured via VITE_API_URL environment variable)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

/**
 * Optimize a prompt using the backend AI service
 * @param {string} userInput - The prompt to optimize
 * @param {string} userID - The user's ID
 * @returns {Promise} The optimized prompt data
 */
export const optimizePromptService = async (userInput, userID = "default-user") => {
  try {
    const payload = {
      userID: userID,
      inputPrompt: userInput,
    };

    const response = await axios.post(`${API_URL}/optimize`, payload);
    return response.data;

  } catch (error) {
    console.error("Backend Error:", error);
    throw error;
  }
};

/**
 * Get prompt history for a user
 * @param {string} userID - The user's ID
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise} The prompt history
 */
export const getPromptHistoryService = async (userID, limit = 50) => {
  try {
    const response = await axios.get(`${API_URL}/history/${userID}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("History fetch error:", error);
    throw error;
  }
};

/**
 * Delete a prompt from history
 * @param {string} promptID - The prompt ID to delete
 * @returns {Promise} The deletion result
 */
export const deletePromptService = async (promptID) => {
  try {
    const response = await axios.delete(`${API_URL}/prompt/${promptID}`);
    return response.data;
  } catch (error) {
    console.error("Delete prompt error:", error);
    throw error;
  }
};

/**
 * Save user feedback for a prompt
 * @param {Object} feedbackData - The feedback data
 * @returns {Promise} The saved feedback result
 */
export const saveFeedbackService = async (feedbackData) => {
  try {
    const response = await axios.post(`${API_URL}/feedback`, feedbackData);
    return response.data;
  } catch (error) {
    console.error("Save feedback error:", error);
    throw error;
  }
};

/**
 * Toggle favorite status of a prompt
 * @param {string} promptID - The prompt ID
 * @param {boolean} isFavorite - The new favorite status
 * @returns {Promise} The update result
 */
export const toggleFavoriteService = async (promptID, isFavorite) => {
  try {
    const response = await axios.put(`${API_URL}/prompt/${promptID}/favorite`, { isFavorite });
    return response.data;
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @returns {Promise} The created user result
 */
export const createUserService = async (userData) => {
  try {
    const payload = {
      name: userData.name,
      surname: userData.surname,
      username: userData.username,
      email: userData.email,
      profileImageURL: userData.profileImageURL || null
    };

    const response = await axios.post(`${API_URL}/create`, payload);
    return response.data;

  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {string} userID - The user ID
 * @returns {Promise} The user data
 */
export const getUserService = async (userID) => {
  try {
    const response = await axios.get(`${API_URL}/${userID}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

/**
 * Login user
 * @param {string} username - The username
 * @param {string} password - The password
 * @returns {Promise} The login result with token
 */
export const loginService = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Test Nebius AI endpoint
 * @param {string} userInput - The input to test
 * @param {string} aiModel - The AI model to use
 * @returns {Promise} The AI response
 */
export const testNebiusService = async (userInput, aiModel = "meta-llama/Llama-3.3-70B-Instruct") => {
  try {
    const response = await axios.post(`${API_URL}/testNebius`, {
      user_input: userInput,
      ai_model: aiModel
    });
    return response.data;
  } catch (error) {
    console.error("Test Nebius error:", error);
    throw error;
  }
};
