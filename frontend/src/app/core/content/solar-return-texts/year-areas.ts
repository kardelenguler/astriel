/**
 * Solar Return "Yıllık Yorumlar" metinleri.
 * Bir alanın yorumu: evin teması + gezegenin katkısı + burcun tarzı + kapanış önerisi olarak
 * birleştirilir. Genel astrolojik gelenekten derlenmiş açıklamalardır; kesin öngörü değildir.
 */

/** Gezegen o evdeyken o alanda neler öne çıkar (2 cümle) */
export const HOUSE_THEMES: Record<number, string> = {
  1: 'Bu yıl odak sensin: kimliğin, görünüşün ve kendini ifade etme biçimin ön planda. Yeni bir başlangıç yapmak için uygun bir dönem olabilir.',
  2: 'Bu yıl para, kazanç ve sahip olduklarının yönetimi öne çıkıyor. Neye değer verdiğini yeniden düşünmen gerekebilir.',
  3: 'Bu yıl iletişim, öğrenme ve çevrenle kurduğun bağlar canlanıyor. Kısa yolculuklar ve yeni fikirler gündeme gelebilir.',
  4: 'Bu yıl ev, aile ve köklerin hayatının merkezinde. Yaşam alanın ve yakınlarınla ilgili önemli konular gündeme gelebilir.',
  5: 'Bu yıl keyif, aşk ve yaratıcılık ön planda. Kendini ifade etmek ve eğlenmek için fırsatlar çıkabilir.',
  6: 'Bu yıl günlük düzen, sağlık alışkanlıkları ve iş rutinlerin öne çıkıyor. Küçük ayarlamalar büyük fark yaratabilir.',
  7: 'Bu yıl ilişkiler hayatının merkezinde. Yakın bağlar güçlenebilir, yeni biriyle tanışma ya da mevcut ilişkide derinleşme gündeme gelebilir.',
  8: 'Bu yıl ortak kaynaklar, derin bağlar ve dönüşüm konuları öne çıkıyor. Ortak para, borç ya da miras gibi konular gündeme gelebilir.',
  9: 'Bu yıl ufkun genişliyor: yolculuklar, eğitim ve yeni bakış açıları ön planda. Hayata daha geniş bir yerden bakma isteği artabilir.',
  10: 'Bu yıl iş hayatı, hedefler ve toplumsal konumun öne çıkıyor. Emeğinin görünür olduğu bir dönem olabilir.',
  11: 'Bu yıl arkadaşlar, topluluklar ve ortak hayaller öne çıkıyor. Sosyal çevren değişip genişleyebilir.',
  12: 'Bu yıl içe dönüş, dinlenme ve kendinle baş başa kalma ihtiyacı öne çıkıyor. Geride bırakman gereken şeyler netleşebilir.',
};

/** Ev kuşağı cümlelerinde evin adı: "Kazanç evin Terazi burcunda başlıyor" */
export const HOUSE_LABELS: Record<number, string> = {
  1: 'Benlik evin',
  2: 'Kazanç evin',
  3: 'İletişim evin',
  4: 'Yuva evin',
  5: 'Keyif ve aşk evin',
  6: 'Günlük düzen evin',
  7: 'İlişkiler evin',
  8: 'Ortak kaynaklar evin',
  9: 'Yolculuk ve öğrenme evin',
  10: 'Kariyer evin',
  11: 'Arkadaşlar evin',
  12: 'İç dünya evin',
};

/** Gezegenin bir alana kattığı şey (cümle "bu alanda" ile biter/akar) */
export const PLANET_LINES: Record<string, string> = {
  sun: 'Güneş bu alanda ışığını tutuyor; dikkatin ve enerjin yıl boyunca buraya sık sık dönebilir.',
  moon: 'Ay bu alanda duygularını öne çıkarıyor; sezgilerin ve ihtiyaçların daha belirgin hissedilebilir.',
  mercury: 'Merkür bu alanda konuşmayı, planlamayı ve bilgi alışverişini hareketlendiriyor.',
  venus: 'Venüs bu alanda uyum, hoşnutluk ve yakınlık getiriyor; güzel ve dengeli deneyimler çıkabilir.',
  mars: 'Mars bu alanda enerji ve cesaret getiriyor; harekete geçme isteğin güçlü olabilir.',
  jupiter: 'Jüpiter bu alanda genişleme ve şans getiriyor; fırsatlar ve destek hissedilebilir.',
  saturn: 'Satürn bu alanda sorumluluk ve sabır getiriyor; emeğinin karşılığı yavaş ama sağlam gelebilir.',
  uranus: 'Uranüs bu alanda beklenmedik değişimler getiriyor; alışılmış düzenin dışına çıkma isteği artabilir.',
  neptune: 'Neptün bu alanda hayal gücünü ve duyarlılığı artırıyor; her şey net görünmeyebilir.',
  pluto: 'Plüton bu alanda derin bir dönüşüm getiriyor; eskiyen şeyler bırakılıp yenilenme yaşanabilir.',
};

/**
 * Burcun tarzı: "bu alanda ___ bir tarz öne çıkabilir" cümlesinde kullanılır.
 * Anahtarlar backend'deki burç anahtarlarıdır.
 */
export const SIGN_STYLES: Record<string, string> = {
  aries: 'doğrudan, atak ve hızlı',
  taurus: 'sakin, kararlı ve konforu önemseyen',
  gemini: 'meraklı, hareketli ve konuşkan',
  cancer: 'duyarlı, korumacı ve sezgisel',
  leo: 'cömert, kendinden emin ve gösterişli',
  virgo: 'özenli, pratik ve ayrıntıcı',
  libra: 'dengeli, uyumlu ve diplomatik',
  scorpio: 'yoğun, derin ve tutkulu',
  sagittarius: 'özgür, iyimser ve keşfetmeye açık',
  capricorn: 'ciddi, planlı ve disiplinli',
  aquarius: 'bağımsız, yenilikçi ve farklı',
  pisces: 'hayalperest, şefkatli ve akışına bırakan',
};

/** Ana gezegene göre kapanış önerisi */
export const PLANET_CLOSING: Record<string, string> = {
  sun: 'Enerjini bu alana bilinçli yönlendirmek sana iyi gelir.',
  moon: 'Hislerini görmezden gelmek yerine dinlemek işini kolaylaştırır.',
  mercury: 'Düşündüklerini açıkça ifade etmek ve yazıya dökmek bu yıl işe yarar.',
  venus: 'Beklentilerini açıkça konuşmak ve kendine keyif payı ayırmak bu yıl işini kolaylaştırır.',
  mars: 'Enerjini sabırsızlığa değil, net bir hedefe harcamak daha verimli olur.',
  jupiter: 'Gelen fırsatlara açık olmak ama abartıya kaçmamak bu yıl iyi bir denge.',
  saturn: 'Acele etmeden adım adım ilerlemek bu yıl en iyi yol.',
  uranus: 'Değişime direnmek yerine esnek kalmak işini kolaylaştırır.',
  neptune: 'Önemli kararlarda net bilgiye dayanmak ve hayalle gerçeği ayırmak iyi olur.',
  pluto: 'Kontrol etmeye çalışmak yerine sürece güvenmek ve gerekeni bırakmak seni rahatlatır.',
};

/** Alanda hiç gezegen yoksa açılış cümlesi */
export const EMPTY_AREA_TEXTS: Record<string, string> = {
  love: 'Bu yıl aşk ve ilişkiler gündemin merkezinde değil, var olan bağlarını korumak ve sakin ilerlemek yeterli.',
  career: 'Bu yıl iş hayatı gündemin merkezinde değil, mevcut düzenini sürdürmek yeterli.',
  money: 'Bu yıl para konusu gündemin merkezinde değil, mevcut düzenini korumak yeterli.',
  home: 'Bu yıl ev ve aile konuları gündemin merkezinde değil, yaşam alanında köklü bir değişiklik beklenmiyor.',
  friends:
    'Bu yıl arkadaşlar ve sosyal çevre gündemin merkezinde değil, mevcut dostluklarını sürdürmek yeterli.',
  learning:
    'Bu yıl öğrenme ve yolculuk konuları gündemin merkezinde değil, mevcut planlarına devam edebilirsin.',
  routine:
    'Bu yıl günlük düzen ve alışkanlıklar gündemin merkezinde değil, rutinlerini olduğu gibi sürdürmek yeterli.',
  inner:
    'Bu yıl iç dünya ve yenilenme konuları gündemin merkezinde değil, kendi temponda ilerlemek yeterli.',
};

export const EMPTY_AREA_FALLBACK =
  'Bu yıl bu alan gündemin merkezinde değil, mevcut düzenini korumak yeterli.';