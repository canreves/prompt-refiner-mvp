import React, { useState } from 'react';
import { createUserService } from '../services/api';

const UserCreator = () => {
  // Form alanları
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    profileImageURL: ""
  });

  // Durum yönetimi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Input değişikliklerini işle
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Kullanıcı oluştur
  const handleCreateUser = async () => {
    // Validasyon
    if (!formData.name || !formData.surname || !formData.username || !formData.email) {
      setError("Lütfen tüm zorunlu alanları doldurun!");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await createUserService(formData);
      setSuccess(`✅ Kullanıcı başarıyla oluşturuldu! ID: ${response.userID}`);
      
      // Formu temizle
      setFormData({
        name: "",
        surname: "",
        username: "",
        email: "",
        profileImageURL: ""
      });
    } catch (err) {
      setError(`❌ Hata: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", border: "1px solid #ddd", borderRadius: "8px", marginTop: "20px" }}>
      <h2>👤 Yeni Kullanıcı Ekle</h2>
      
      {/* Ad */}
      <div style={{ marginBottom: "10px" }}>
        <label>Ad *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="Ad giriniz"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* Soyad */}
      <div style={{ marginBottom: "10px" }}>
        <label>Soyad *</label>
        <input
          type="text"
          name="surname"
          value={formData.surname}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="Soyad giriniz"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* Kullanıcı adı */}
      <div style={{ marginBottom: "10px" }}>
        <label>Kullanıcı Adı *</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="Kullanıcı adı giriniz"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* Email */}
      <div style={{ marginBottom: "10px" }}>
        <label>Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="email@example.com"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      {/* Profil Fotoğrafı URL (isteğe bağlı) */}
      <div style={{ marginBottom: "10px" }}>
        <label>Profil Fotoğrafı URL (İsteğe bağlı)</label>
        <input
          type="url"
          name="profileImageURL"
          value={formData.profileImageURL}
          onChange={handleInputChange}
          disabled={loading}
          placeholder="https://example.com/image.jpg"
          style={{ width: "100%", padding: "8px", marginTop: "5px" }}
        />
      </div>

      <br />

      {/* Buton */}
      <button
        onClick={handleCreateUser}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "default" : "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Oluşturuluyor..." : "Kullanıcı Oluştur"}
      </button>

      <hr />

      {/* Durum mesajları */}
      {loading && <p style={{ color: "blue" }}>⏳ Lütfen bekleyin...</p>}
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default UserCreator;
