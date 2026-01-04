/**
 * NoirNote — Türkçe metin kaynağı (tek kaynak).
 *
 * Kurallar:
 * - Kullanıcıya görünen tüm metinler buradan gelmeli.
 * - Bileşenler/sayfalar içinde metin sabitlemeyin.
 * - Gelecekte `texts.en.ts` eklemek için anahtar yapısını semantik tutun.
 */
export const textsTR = {
  common: {
    appName: "NoirNote",
    loading: "Yükleniyor…",
    continue: "Devam et",
    back: "Geri",
    close: "Kapat",
    cancel: "İptal",
  },
  meta: {
    title: "NoirNote",
    description:
      "NoirNote: cinayet çıkarımı ve mantık bulmacası oyunu. (Kurulum aşaması)",
  },
  home: {
    title: "NoirNote",
    subtitle:
      "Cinayet çıkarımı ve mantık bulmacaları için minimal temel kurulum.",
    primaryCta: "Giriş yap",
    secondaryCta: "Gösterge paneline git",
  },
  login: {
    title: "Giriş",
    subtitle: "Devam etmek için Google hesabınla giriş yap.",
    googleButton: "Google ile giriş yap",
    signingIn: "Giriş yapılıyor…",
    redirecting: "Yönlendiriliyorsun…",
  },
  nav: {
    dashboard: "Gösterge Paneli",
    profile: "Profil",
    leaderboard: "Liderlik Tablosu",
    logout: "Çıkış yap",
    login: "Giriş",
  },
  dashboard: {
    title: "Gösterge Paneli",
    placeholder:
      "Burası oyun akışı için başlangıç noktası olacak. (İskelet sayfa)",
  },
  cases: {
    list: {
      title: "Vakalar",
      startButton: "Vakayı Başlat",
    },
    clues: "İpuçları",
    boardPlaceholder: "Oyun tahtası burada olacak",
    case001: {
      title: "Müze Soygunu",
      clues: {
        clue1: "Katil, suç mahallinde bir parmak izi bırakmış.",
        clue2: "Olay yerinde bulunan eşya, şüphelilerden birinin evinde de var.",
        clue3: "Şahit ifadesine göre, katil olay yerinden koşarak kaçmış.",
        clue4: "Suç aleti, suç mahallinden 100 metre uzakta bulunmuş.",
        clue5: "Katil, olay sırasında sağlak bir kişi olmalı.",
      },
    },
  },
  suspects: {
    suspect001: "Ahmet Yılmaz",
    suspect002: "Zeynep Kaya",
    suspect003: "Mehmet Demir",
  },
  locations: {
    location001: "Müze Girişi",
    location002: "Sergi Salonu",
    location003: "Depo",
  },
  items: {
    item001: "Bıçak",
    item002: "Çekiç",
    item003: "Silah",
  },
  difficulty: {
    label: "Zorluk:",
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
  },
  profile: {
    title: "Profil",
    placeholder:
      "Burası profil ayarları ve istatistikler için ayrılacak. (İskelet sayfa)",
  },
  leaderboard: {
    title: "Liderlik Tablosu",
    placeholder:
      "Burası puanlar ve sıralamalar için ayrılacak. (İskelet sayfa)",
  },
  errors: {
    unknown: "Bir şeyler ters gitti.",
    network: "Ağ bağlantısı hatası. Lütfen tekrar dene.",
    authPopupClosed: "Giriş penceresi kapatıldı.",
    authFailed: "Giriş başarısız. Lütfen tekrar dene.",
    configMissing:
      "Uygulama yapılandırması eksik. Lütfen ortam değişkenlerini kontrol et.",
  },
  a11y: {
    appLogoAlt: "NoirNote logosu",
  },
} as const;

export type TextsTR = typeof textsTR;

