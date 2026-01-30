# Firebase Kurulum Rehberi

Bu uygulama, kullanıcı authentication (giriş/kayıt) ve rating'lerin (1-5) Firestore database'de saklanması için Firebase kullanır. Ratings doğrudan prompts koleksiyonunda saklanır.

## Adım 1: Firebase Projesi Oluşturma

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. "Add project" butonuna tıklayın
3. Proje adını girin ve kurulum adımlarını tamamlayın
4. Google Analytics'i istediğinize göre aktif edebilir veya devre dışı bırakabilirsiniz

## Adım 2: Web Uygulaması Ekleyin

1. Firebase Console'da projenize gidin
2. Sol menüden "Project Overview" yanındaki dişli ikonuna tıklayın ve "Project settings" seçin
3. "Your apps" bölümünde web ikonu (</>)'na tıklayın
4. App nickname'i girin (örn: "Prompt Optimizer")
5. "Register app" butonuna tıklayın
6. Firebase configuration objesini kopyalayın

## Adım 3: Firebase Configuration'ı Güncelle

`/src/config/firebase.js` dosyasını açın ve Firebase configuration değerlerini kendi değerlerinizle değiştirin:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Adım 4: Firebase Authentication Kurulumu

1. Firebase Console'da sol menüden **"Authentication"** seçeneğine tıklayın
2. **"Get started"** butonuna tıklayın
3. **"Sign-in method"** sekmesine gidin
4. **"Email/Password"** seçeneğini bulun ve tıklayın
5. **"Enable"** toggle'ını aktif edin
6. **"Email link (passwordless sign-in)"** seçeneğini kapalı bırakabilirsiniz (opsiyonel)
7. **"Save"** butonuna tıklayın

✅ Artık kullanıcılar e-posta ve şifre ile kayıt olup giriş yapabilir!

## Adım 5: Firestore Database Oluşturma

1. Firebase Console'da sol menüden "Firestore Database" seçeneğine tıklayın
2. "Create database" butonuna tıklayın
3. **Production mode** veya **Test mode** seçin
   - **Test mode**: Geliştirme aşamasında kullanın (30 gün sonra kuralları güncellemeniz gerekir)
   - **Production mode**: Güvenlik kurallarını manuel olarak ayarlayın
4. Database lokasyonunu seçin (size en yakın lokasyonu tercih edin)
5. "Enable" butonuna tıklayın

## Adım 6: Güvenlik Kurallarını Ayarlama

Firestore güvenlik kurallarını ayarlamak için:

1. Firebase Console'da "Firestore Database" > "Rules" sekmesine gidin
2. Aşağıdaki kuralları ekleyin:

### Geliştirme İçin (Test Mode):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production İçin (Önerilen):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Prompts collection - ratings are stored directly in prompt documents
    match /prompts/{promptId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userID;
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == resource.data.userID;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userID;
    }
  }
}
```

## Adım 7: Collection Yapısı

Uygulama, Firestore'da `prompts` koleksiyonunu kullanır. Ratings (1-5) doğrudan prompt dokümanında saklanır:

```javascript
{
  promptID: "...",
  userID: "...",
  inputPrompt: "...",
  optimizedPrompts: {...},
  ratings: {
    user: 5                     // 1-5 arası kullanıcı değerlendirmesi
  },
  initialTokenSize: 123,
  latencyMs: {...},
  createdAt: Timestamp
}
```

## Adım 8: Uygulamayı Test Etme

### Authentication Testi:
1. Uygulamayı çalıştırın
2. Login sayfasında **"Don't have an account? Sign Up"** linkine tıklayın
3. E-posta ve şifre girerek yeni bir hesap oluşturun
4. Başarılı kayıt sonrası otomatik olarak giriş yapılacak
5. Sağ üst köşedeki **"Logout"** butonu ile çıkış yapabilirsiniz
6. Tekrar giriş yapmak için aynı e-posta ve şifreyi kullanın

### Rating Testi:
1. Giriş yaptıktan sonra bir prompt girin ve optimize edin
2. Sonuçta görünen yıldız rating sistemini kullanarak 1-5 arası değerlendirme yapın
3. Firebase Console > Firestore Database'de `prompts` koleksiyonunu kontrol edin
4. İlgili prompt dokümanında `ratings.user` alanının güncellendiğini göreceksiniz

### Kullanıcı Kontrolü:
1. Firebase Console > Authentication > Users sekmesine gidin
2. Kayıt olan kullanıcıları görebilirsiniz

## Güvenlik Notları

⚠️ **ÖNEMLİ**: 
- Production ortamında API key'lerinizi environment variables'da saklayın
- Test mode güvenlik kurallarını production'da kullanmayın
- Kullanıcı kimlik doğrulama eklemek istiyorsanız Firebase Authentication'ı entegre edin

## Sorun Giderme

### "Missing or insufficient permissions" Hatası
- Firestore güvenlik kurallarınızı kontrol edin
- Test mode'da olduğunuzdan emin olun veya kuralları doğru ayarladığınızdan emin olun

### Firebase Configuration Hatası
- `/src/config/firebase.js` dosyasındaki tüm değerlerin doğru olduğundan emin olun
- Firebase Console'dan configuration'ı tekrar kopyalayıp yapıştırın

### Authentication Hatası
- Firebase Console > Authentication bölümünün aktif olduğundan emin olun
- Email/Password sign-in method'unun enabled olduğundan emin olun
- Şifrenin en az 6 karakter olduğundan emin olun

### Network Error
- Firebase projenizin aktif olduğundan emin olun
- Firestore Database'in enabled olduğundan emin olun
- İnternet bağlantınızı kontrol edin

## Ek Özellikler (Gelecek Geliştirmeler)

- ✅ Firebase Authentication ile kullanıcı girişi (TAMAMLANDI)
- Kullanıcıya özel prompt geçmişi kaydetme
- Feedback'leri listeleme ve analiz etme dashboard'u
- Firestore'dan feedback'leri okuma ve raporlama
- Real-time updates ile canlı feedback gösterimi
- Şifre sıfırlama özelliği
- Google Sign-In entegrasyonu