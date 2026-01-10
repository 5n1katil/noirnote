# Add Average Time to Global Leaderboard

## Problem
- Genel sıralamada ortalama süre gösterilmiyor
- Kullanıcı, her vaka için ilk başarılı deneme sürelerinin ortalamasını görmek istiyor

## Solution
1. **LeaderboardEntry type'ını güncelle**
   - `averageTimeMs` field'ı ekle (global leaderboard için)

2. **updateGlobalLeaderboard fonksiyonunu güncelle**
   - `averageTimeMs` parametresi ekle
   - Firestore'a `averageTimeMs` field'ını kaydet

3. **processCaseCompletion fonksiyonunu güncelle**
   - Stats'den `averageTimeMs`'i al
   - `updateGlobalLeaderboard` çağrısına `averageTimeMs` parametresi ekle

4. **recalculateStats fonksiyonunu güncelle**
   - `updateGlobalLeaderboard` çağrısına `averageTimeMs` parametresi ekle

5. **LeaderboardClient.tsx'i güncelle**
   - Global leaderboard tablosuna "Ortalama Süre" kolonu ekle
   - `formatDuration` fonksiyonunu kullanarak göster

## Expected Result
- Genel sıralamada her oyuncunun ortalama süresi görünecek
- Ortalama süre, her vaka için ilk başarılı deneme sürelerinin ortalaması olacak
- Case-specific leaderboard'da değişiklik olmayacak

## Files to Change
- `src/lib/leaderboard.client.ts` - Type ve fonksiyon güncellemeleri
- `src/lib/recalculateStats.client.ts` - averageTimeMs parametresi ekleme
- `src/app/leaderboard/LeaderboardClient.tsx` - UI'da ortalama süre kolonu ekleme
