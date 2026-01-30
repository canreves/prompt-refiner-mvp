import axios from 'axios';
import type {
  PromptInput,
  PromptDBModel,
  OptimizeResponse,
  FeedbackRequest,
  PromptHistoryResponse,
  User,
  AuthUser
} from '@/types';

// Backend URL (configured via VITE_API_URL environment variable)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/v1";

// ============== Prompt Services ==============

/**
 * Optimize a prompt using the backend AI service
 */
export const optimizePromptService = async (
  userInput: string, 
  userID: string = "default-user"
): Promise<OptimizeResponse> => {
  try {
    const payload: PromptInput = {
      userID: userID,
      inputPrompt: userInput,
    };

    const response = await axios.post<OptimizeResponse>(`${API_URL}/optimize`, payload);
    return response.data;

  } catch (error) {
    console.error("Backend Error:", error);
    throw error;
  }
};

/**
 * Get prompt history for a user
 */
export const getPromptHistoryService = async (
  userID: string, 
  limit: number = 50
): Promise<PromptDBModel[]> => {
  try {
    const response = await axios.get<PromptDBModel[]>(`${API_URL}/history/${userID}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("History fetch error:", error);
    throw error;
  }
};

/**
 * Get a single prompt by ID
 */
export const getPromptService = async (promptID: string): Promise<PromptDBModel | null> => {
  try {
    const response = await axios.get<PromptDBModel>(`${API_URL}/prompt/${promptID}`);
    return response.data;
  } catch (error) {
    console.error("Get prompt error:", error);
    throw error;
  }
};

/**
 * Delete a prompt from history
 */
export const deletePromptService = async (promptID: string): Promise<{ success: boolean }> => {
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
 */
export const saveFeedbackService = async (feedbackData: FeedbackRequest): Promise<{ success: boolean }> => {
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
 */
export const toggleFavoriteService = async (
  promptID: string, 
  isFavorite: boolean
): Promise<{ success: boolean }> => {
  try {
    const response = await axios.put(`${API_URL}/prompt/${promptID}/favorite`, { isFavorite });
    return response.data;
  } catch (error) {
    console.error("Toggle favorite error:", error);
    throw error;
  }
};

// ============== User Services ==============

/**
 * Create a new user
 */
export const createUserService = async (userData: Partial<User>): Promise<User> => {
  try {
    const payload = {
      name: userData.name,
      surname: userData.surname,
      username: userData.username,
      email: userData.email,
      profileImageURL: userData.profileImageURL || null
    };

    const response = await axios.post<User>(`${API_URL}/create`, payload);
    return response.data;

  } catch (error) {
    console.error("Create user error:", error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserService = async (userID: string): Promise<User | null> => {
  try {
    const response = await axios.get<User>(`${API_URL}/${userID}`);
    return response.data;
  } catch (error) {
    console.error("Get user error:", error);
    throw error;
  }
};

// ============== Auth Services ==============

/**
 * Verify Firebase token with backend
 */
export const verifyTokenService = async (idToken: string): Promise<AuthUser> => {
  try {
    const response = await axios.post<AuthUser>(`${API_URL}/auth/verify-token`, {
      id_token: idToken
    });
    return response.data;
  } catch (error) {
    console.error("Verify token error:", error);
    throw error;
  }
};

// ============== Test Services ==============

/**
 * Test Nebius AI endpoint
 */
export const testNebiusService = async (
  userInput: string, 
  aiModel: string = "meta-llama/Llama-3.3-70B-Instruct"
): Promise<any> => {
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
