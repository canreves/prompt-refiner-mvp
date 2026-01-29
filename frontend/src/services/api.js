
import axios from 'axios';

// Backend URL'i (Render'da REACT_APP_API_URL ile ayarlanır)
const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1"; 

export const optimizePromptService = async (userInput) => {
  try {
    // Backend'e gönderilecek paket (Kaptanın belirlediği kurala uygun)
    const payload = {
      user_id: "test-user-ece", // Şimdilik sabit
      input_prompt: userInput,
      model_preference: "nebius-70b"
    };

    // İsteği gönderiyoruz (POST)
    const response = await axios.post(`${API_URL}/optimize`, payload);

    // Başarılı olursa cevabı döndür
    return response.data;

  } catch (error) {
    // Hata olursa konsola yaz ve hatayı fırlat
    console.error("Backend Hatası:", error);
    throw error;
  } 
};

export const createUserService = async (userData) => {
  try {
    // Backend'e gönderilecek kullanıcı verisi
    const payload = {
      name: userData.name,
      surname: userData.surname,
      username: userData.username,
      email: userData.email,
      profileImageURL: userData.profileImageURL || null
    };

    // İsteği gönderiyoruz (POST)
    const response = await axios.post(`${API_URL}/create`, payload);

    // Başarılı olursa cevabı döndür
    return response.data;

  } catch (error) {
    // Hata olursa konsola yaz ve hatayı fırlat
    console.error("Kullanıcı oluşturma hatası:", error);
    throw error;
  }
};