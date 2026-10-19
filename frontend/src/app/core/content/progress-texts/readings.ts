/**
 * Progress "Yaş Yorumları" metinleri.
 * Bir alanın yorumu: evin teması + gezegenin katkısı + burcun tarzı + kapanış önerisi.
 * Genel astrolojik gelenekten derlenmiş açıklamalardır; kesin öngörü değildir.
 */

/** Progress gezegeni hangi evdeyse o alanda neler öne çıkar (2 cümle) */
export const PROGRESS_HOUSE_THEMES: Record<number, string> = {
  1: 'Bu dönemde odak sende: kimliğin, görünüşün ve kendini ifade etme biçimin değişiyor olabilir. Yeni bir başlangıç hissi öne çıkabilir.',
  2: 'Bu dönemde para, kazanç ve değer verdiklerin yeniden şekilleniyor olabilir. Maddi güvenlik konuları seni daha çok düşündürebilir.',
  3: 'Bu dönemde iletişim, öğrenme ve çevrenle ilişkilerin öne çıkıyor. Yeni fikirler ve kısa yolculuklar gündeme gelebilir.',
  4: 'Bu dönemde ev, aile ve köklerinle ilgili konular öne çıkıyor. Yaşam alanında bir değişiklik ya da yeniden düzenleme gündeme gelebilir.',
  5: 'Bu dönemde aşk, keyif ve yaratıcılık ön planda. Kendini ifade etmek ve hayattan zevk almak için fırsatlar çıkabilir.',
  6: 'Bu dönemde günlük düzen, çalışma hayatı ve sağlık alışkanlıkların öne çıkıyor. Rutinlerini yeniden kurmak iyi gelebilir.',
  7: 'Bu dönemde ilişkiler ve ortaklıklar hayatının merkezinde. Yakın bağlarda yeni bir aşama başlayabilir.',
  8: 'Bu dönemde ortak kaynaklar, derin bağlar ve dönüşüm konuları öne çıkıyor. Bir şeyleri bırakıp yenilenme ihtiyacı doğabilir.',
  9: 'Bu dönemde ufkun genişliyor: eğitim, yolculuk ve yeni bakış açıları ön planda. Hayata dair inançlarını gözden geçirebilirsin.',
  10: 'Bu dönemde iş hayatı, hedefler ve toplumsal konumun öne çıkıyor. Hayatında yeni bir kariyer aşaması başlıyor olabilir.',
  11: 'Bu dönemde arkadaşlar, topluluklar ve ortak hayaller öne çıkıyor. Sosyal çevrende bir yenilenme yaşanabilir.',
  12: 'Bu dönemde içe dönüş, dinlenme ve kendinle yüzleşme ihtiyacı öne çıkıyor. Geride bırakılması gereken şeyler netleşebilir.',
};

/** Progress gezegeninin bir alana kattığı şey */
export const PROGRESS_PLANET_LINES: Record<string, string> = {
  moon: 'Progress Ay bu alanda duygusal ihtiyaçlarını öne çıkarıyor; neye güvendiğini ve neye ihtiyaç duyduğunu daha net hissedebilirsin.',
  sun: 'Progress Güneş bu alanda yeni bir yaşam dönemini başlatıyor; dikkatin ve enerjin buraya yönelebilir.',
  venus: 'Progress Venüs bu alanda uyum ve hoşnutluk getiriyor; değer verdiklerin netleşebilir.',
  mars: 'Progress Mars bu alanda enerji ve harekete geçme isteği getiriyor; cesur adımlar atmak kolaylaşabilir.',
  mercury:
    'Progress Merkür bu alanda düşünme ve konuşma biçimini canlandırıyor; yeni bilgiler ve planlar gündeme gelebilir.',
};

/** Ana gezegene göre kapanış önerisi */
export const PROGRESS_PLANET_CLOSING: Record<string, string> = {
  moon: 'Duygularını dinlemek ve kendine zaman tanımak bu dönemde işini kolaylaştırır.',
  sun: 'Enerjini bu alana bilinçli yönlendirmek bu dönemde sana iyi gelir.',
  venus: 'Kendine ve ilişkilerine özen göstermek bu dönemde işini kolaylaştırır.',
  mars: 'Enerjini net bir hedefe yönlendirmek ve acele etmemek bu dönemde verimli olur.',
  mercury: 'Düşündüklerini açıkça ifade etmek ve planlarını yazıya dökmek bu dönemde işe yarar.',
};

/** Yorumlarda kullanılan progress gezegenleri; önce gelen "ana gezegen" olur */
export const PROGRESS_PRIORITY = ['moon', 'sun', 'venus', 'mars', 'mercury'];

/** Yorum kartları (Genel Tema ayrıca, Güneş ve Ay'dan üretilir) */
export type ProgressAreaKey = 'theme' | 'love' | 'career' | 'money' | 'home' | 'growth';

export const PROGRESS_AREAS: { key: ProgressAreaKey; title: string; houses: number[] }[] = [
  { key: 'theme', title: 'Genel Tema', houses: [] },
  { key: 'love', title: 'Aşk ve İlişkiler', houses: [5, 7] },
  { key: 'career', title: 'Eğitim ve Kariyer', houses: [3, 6, 9, 10] },
  { key: 'money', title: 'Para ve Maddi Konular', houses: [2, 8] },
  { key: 'home', title: 'Aile ve Yaşam Düzeni', houses: [4] },
  { key: 'growth', title: 'Kişisel Gelişim', houses: [1, 11, 12] },
];

/** Alanda hiç progress gezegeni yoksa açılış cümlesi */
export const PROGRESS_EMPTY_TEXTS: Record<string, string> = {
  love: 'Bu dönemde aşk ve ilişkiler gündemin merkezinde değil, mevcut bağlarını korumak yeterli.',
  career:
    'Bu dönemde eğitim ve kariyer gündemin merkezinde değil, mevcut düzenini sürdürmek yeterli.',
  money: 'Bu dönemde para konusu gündemin merkezinde değil, mevcut düzenini korumak yeterli.',
  home: 'Bu dönemde ev ve aile konuları gündemin merkezinde değil, yaşam düzeninde köklü bir değişiklik beklenmiyor.',
  growth:
    'Bu dönemde kişisel gelişim konuları gündemin merkezinde değil, kendi temponda ilerlemek yeterli.',
};

export const PROGRESS_EMPTY_FALLBACK =
  'Bu dönemde bu alan gündemin merkezinde değil, mevcut düzenini korumak yeterli.';