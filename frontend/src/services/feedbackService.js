import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Save user feedback to Firestore
 * @param {Object} feedbackData - The feedback data to save
 * @param {string} feedbackData.originalPrompt - Original user prompt
 * @param {string} feedbackData.optimizedPrompt - Optimized prompt
 * @param {number} feedbackData.rating - User rating (1-5)
 * @param {string} [feedbackData.selectedLLM] - Selected LLM model (optional)
 * @param {Object} [feedbackData.scoreWeights] - Score weights (optional)
 * @param {number} feedbackData.tokenCount - Token count
 * @param {number} feedbackData.latency - Processing time in milliseconds
 * @returns {Promise<string>} The document ID of the saved feedback
 */
export const saveFeedback = async (feedbackData) => {
  try {
    const feedbackCollection = collection(db, 'feedbacks');
    const docRef = await addDoc(feedbackCollection, {
      ...feedbackData,
      createdAt: serverTimestamp(),
    });
    
    console.log('Feedback saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};