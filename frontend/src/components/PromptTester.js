import React, { useState } from 'react';
import { optimizePromptService } from '../services/api'; // Yazdığımız servisi çağırıyoruz

const PromptTester = () => {
  // Durumları (State) tutuyoruz
  const [input, setInput] = useState("");          // Kullanıcının yazdığı yazı
  const [result, setResult] = useState(null);      // Backend'den gelen cevap
  const [loading, setLoading] = useState(false);   // Yükleniyor mu?
  const [error, setError] = useState(null);        // Hata var mı?

  const handleOptimize = async () => {
    // 1. Temizlik yap ve yükleniyor modunu aç
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 2. Servisi çağır (Backend'e git)
      const data = await optimizePromptService(input);
      
      // 3. Gelen cevabı kaydet
      setResult(data); 
    } catch (err) {
      // 4. Hata varsa kaydet
      setError("Backend'e bağlanılamadı! Kaptan'a haber ver.");
    } finally {
      // 5. İşlem bitti, yükleniyor modunu kapat
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>⚡ Prompt Optimizer Test</h2>
      
      {/* Input Alanı */}
      <textarea 
        rows="4" 
        cols="50"
        placeholder="Promptunuzu buraya yazın..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading} // Yüklenirken yazılamasın
      />
      
      <br /><br />

      {/* Gönder Butonu */}
      <button 
        onClick={handleOptimize} 
        disabled={loading || !input} // Yüklenirken veya boşken tıklanmasın
        style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: loading ? "#ccc" : "#007bff", color: "white" }}
      >
        {loading ? "Optimizing..." : "Optimize Et"}
      </button>

      <hr />

      {/* Durum Göstergeleri */}
      {loading && <p style={{ color: "blue" }}>⏳ Yapay zeka düşünüyor, lütfen bekleyin...</p>}
      
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {/* Sonuç Alanı */}
      {result && (
        <div style={{ backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "5px" }}>
          <h3>✅ Sonuç Geldi:</h3>
          <p><strong>Optimize Edilmiş Prompt:</strong></p>
          <p style={{ fontStyle: "italic" }}>{result.optimized_prompt}</p>
          
          <p><small>Token Değişimi: {result.metrics?.initial_tokens} -> {result.metrics?.final_tokens}</small></p>
        </div>
      )}
    </div>
  );
};

export default PromptTester;