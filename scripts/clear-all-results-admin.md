# Tüm Oyuncular İçin Vaka Geçmişi Sıfırlama - Admin Script

Tüm oyuncular için `results` collection'ını temizlemek için Firebase Admin SDK gereklidir.

## Hızlı Yöntem: Firebase Console'dan Manuel Silme (Önerilen)

1. **Firebase Console'a gidin:**
   - https://console.firebase.google.com/
   - Projenizi seçin (NoirNote)

2. **Firestore Database'e gidin:**
   - Sol menüden "Firestore Database" > "Data" sekmesine tıklayın

3. **results collection'ını bulun:**
   - Sol panelde `results` collection'ını göreceksiniz
   - Üzerine tıklayın

4. **Tüm dokümanları seçin:**
   - İlk dokümanı seçin
   - `Ctrl+A` (Windows) veya `Cmd+A` (Mac) ile tümünü seçin
   - VEYA collection'ın sağ üst köşesindeki "Select all" butonuna tıklayın

5. **Silme işlemini onaylayın:**
   - "Delete" butonuna tıklayın (üst menüde)
   - Onaylayın

**Not:** Eğer çok fazla doküman varsa, Firebase Console batch silme yapabilir (500'lük gruplar halinde).

## Alternatif: Firebase CLI ile Silme

Eğer Firebase CLI yüklüyse:

```bash
# Firebase CLI ile login olun
firebase login

# Projenizi seçin (NoirNote proje ID'si ile)
firebase use <your-project-id>

# Results collection'ındaki tüm dokümanları silin
# Not: Bu komut direkt çalışmayabilir, Firestore CLI eklentisi gerekebilir
```

## Node.js Script ile Silme (Admin SDK)

1. **Firebase Admin SDK'yı yükleyin:**
```bash
npm install firebase-admin --save-dev
```

2. **Service Account Key'i indirin:**
   - Firebase Console > Project Settings > Service Accounts
   - "Generate New Private Key" butonuna tıklayın
   - JSON dosyasını proje root'una `firebase-admin-key.json` olarak kaydedin
   - **ÖNEMLİ:** Bu dosyayı `.gitignore`'a ekleyin!

3. **Script'i çalıştırın:**
   - `scripts/clear-all-results-admin.js` dosyasını oluşturun (aşağıdaki kodu kullanın)
   - `node scripts/clear-all-results-admin.js` komutuyla çalıştırın

