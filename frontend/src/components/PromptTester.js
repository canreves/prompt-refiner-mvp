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
      setError("Backend'e bağlanılamadı!");
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

          {/* Parsed Data - Aspects & Scores */}
          {result.parsedData && (
            <div style={{ marginBottom: "20px" }}>
              <h4>📊 Prompt Analizi:</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#ddd" }}>
                    <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ccc" }}>Aspect</th>
                    <th style={{ padding: "8px", textAlign: "left", border: "1px solid #ccc" }}>İçerik</th>
                    <th style={{ padding: "8px", textAlign: "center", border: "1px solid #ccc" }}>Skor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Task</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.task || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.task_score}/10</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Role</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.role || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.role_score}/10</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Style</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.style || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.style_score}/10</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Output</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.output || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.output_score}/10</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Rules</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.rules || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.rules_score}/10</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px", border: "1px solid #ccc", fontWeight: "bold" }}>Context</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc" }}>{result.parsedData.context || "-"}</td>
                    <td style={{ padding: "8px", border: "1px solid #ccc", textAlign: "center" }}>{result.parsedData.context_score}/10</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Optimized Prompt - JSON Format */}
          <div style={{ marginTop: "20px" }}>
            <h4>🎯 Optimize Edilmiş Prompt (JSON):</h4>
            <div style={{ backgroundColor: "#e8e8e8", padding: "10px", borderRadius: "5px" }}>
              <p><strong>Task:</strong> {result.optimizedPrompts?.task || "-"}</p>
              <p><strong>Role:</strong> {result.optimizedPrompts?.role || "-"}</p>
              <p><strong>Style:</strong> {result.optimizedPrompts?.style || "-"}</p>
              <p><strong>Output:</strong> {result.optimizedPrompts?.output || "-"}</p>
              <p><strong>Rules:</strong> {result.optimizedPrompts?.rules || "-"}</p>
              <p><strong>Context:</strong> {result.optimizedPrompts?.context || "-"}</p>
            </div>
          </div>

          <p><small>Token Değişimi: {result.initialTokenSize} → {result.finalTokenSizes?.default}</small></p>
        </div>
      )}
    </div>
  );
};

export default PromptTester;