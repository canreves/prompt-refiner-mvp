import { 
  getAuth, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth as firebaseAuth } from '@/config/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Get Firebase Auth instance
 */
export const auth = firebaseAuth;

/**
 * Google Auth Provider
 */
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google and verify with backend
 * @returns {Promise} User data from backend
 */
export const signInWithGoogle = async () => {
  try {
    // Step 1: Sign in with Google popup
    const result = await signInWithPopup(auth, googleProvider);
    
    // Step 2: Get the ID token
    const idToken = await result.user.getIdToken();
    
    // Step 3: Send token to backend for verification
    const response = await axios.post(`${API_URL}/auth/verify-token`, {
      id_token: idToken
    });
    
    // Return both Firebase result and backend user data
    return {
      user: result.user,
      backendUser: response.data
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Get current user's ID token
 * @returns {Promise<string|null>} ID token or null
 */
export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Verify token with backend (for re-auth on page refresh)
 * @returns {Promise} User data from backend
 */
export const verifyCurrentUser = async () => {
  try {
    const idToken = await getIdToken();
    if (!idToken) {
      return null;
    }
    
    const response = await axios.post(`${API_URL}/auth/verify-token`, {
      id_token: idToken
    });
    
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    return null;
  }
};

/**
 * Sign out current user
 * @returns {Promise}
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Listen to auth state changes
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};