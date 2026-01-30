# 🚀 Quick Start Guide

## Firebase Kurulumu (5 Dakika)

### 1️⃣ Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com/) adresine git
2. **"Add project"** (Proje Ekle) butonuna tıkla
3. Proje adı gir (örn: "prompt-optimizer")
4. Google Analytics'i istersen aktif et (opsiyonel)
5. **"Create project"** butonuna tıkla

### 2️⃣ Web App Kaydı

1. Firebase Console'da projenin ana sayfasında **"Web"** ikonuna tıkla `</>`
2. App nickname gir (örn: "Prompt Optimizer Web")
3. **"Register app"** butonuna tıkla
4. Firebase SDK config'i **KOPYALA** (aşağıdaki gibi bir kod göreceksin):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456"
};
```

### 3️⃣ Config'i Projeye Ekle

1. Projende `/src/config/firebase.js` dosyasını aç
2. Kopyaladığın config değerlerini yapıştır:

**ÖNCEKİ (Değiştirilecek):**
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",        // ❌ Değiştir
  authDomain: "YOUR_AUTH_DOMAIN", // ❌ Değiştir
  projectId: "YOUR_PROJECT_ID",   // ❌ Değiştir
  // ...
};
```

**YENİ (Firebase Console'dan kopyaladığın değerler):**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",        // ✅ Gerçek değer
  authDomain: "your-project.firebaseapp.com",           // ✅ Gerçek değer
  projectId: "your-project",                            // ✅ Gerçek değer
  storageBucket: "your-project.appspot.com",           // ✅ Gerçek değer
  messagingSenderId: "123456789012",                   // ✅ Gerçek değer
  appId: "1:123456789012:web:abc123def456"             // ✅ Gerçek değer
};
```

3. Dosyayı **KAYDET** (Ctrl+S / Cmd+S)

### 4️⃣ Authentication'ı Aktif Et

1. Firebase Console'da **sol menüden** → **"Authentication"** → **"Get started"**
2. **"Sign-in method"** sekmesine git
3. **"Email/Password"** butonuna tıkla
4. **"Enable"** (Aktif Et) toggle'ını **AÇIK** yap ✅
5. **"Save"** butonuna tıkla

### 5️⃣ Firestore Database Oluştur

1. Firebase Console'da **sol menüden** → **"Firestore Database"** → **"Create database"**
2. **"Start in test mode"** seç (geliştirme için)
3. Lokasyon seç (en yakın lokasyon - örn: `europe-west3`)
4. **"Enable"** butonuna tıkla

---

## ✅ Hazır! Şimdi Test Et

1. Sayfayı **yenile** (F5)
2. Login ekranındaki **kırmızı uyarı kutusunun kaybolduğunu** kontrol et
3. **"Sign Up"** linkine tıkla
4. E-posta ve şifre gir (örn: `test@test.com` / `test123`)
5. **"Sign Up"** butonuna tıkla
6. ✅ Başarılı! Ana sayfaya yönlendirileceksin

---

## 🔧 Hata Çözümleri

### ❌ "Firebase Not Configured" Uyarısı Hâlâ Görünüyor
- **Çözüm:** `/src/config/firebase.js` dosyasını kontrol et
- `YOUR_API_KEY` gibi placeholder değerler hâlâ var mı?
- Değerleri Firebase Console'dan doğru kopyaladın mı?
- Dosyayı kaydettikten sonra **sayfayı yenile** (F5)

### ❌ "auth/api-key-not-valid" Hatası
- **Çözüm:** Firebase config'deki `apiKey` değerini kontrol et
- Firebase Console → Project Settings → Your apps → Config kısmından tekrar kopyala

### ❌ "auth/operation-not-allowed" Hatası
- **Çözüm:** Firebase Console → Authentication → Sign-in method
- Email/Password'ün **enabled** (aktif) olduğundan emin ol

### ❌ "Missing or insufficient permissions" Hatası
- **Çözüm:** Firestore Database'i "Test mode"da oluşturdun mu?
- Firebase Console → Firestore Database → Rules
- Test mode kurallarının aktif olduğunu kontrol et

---

## 📚 Daha Fazla Bilgi

Detaylı kurulum adımları için: [FIREBASE_SETUP.md](/FIREBASE_SETUP.md)
