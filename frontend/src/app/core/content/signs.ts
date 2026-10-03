/**
 * Burç parçaları. Hem evlerde hem de Güneş/Ay/Yükselen yorumlarında kullanılır.
 * Anahtarlar backend'deki burç anahtarlarıyla aynıdır (aries, taurus, ...).
 *
 * Cümle kalıbı:
 *   "{name} etkisi bu alanda {themes} temalarını öne çıkarabilir.
 *    Kişi {alan ifadesi} {style}"
 */
export interface SignMeaning {
  name: string;      // "İkizler"
  locative: string;  // "İkizler'de" (ünlü uyumuna göre -de/-da/-te/-ta)
  themes: string;    // "merak, iletişim, öğrenme ve hareketlilik"
  style: string;     // "... eğiliminde olabilir." (küçük harfle başlar)
}

export const SIGN_MEANINGS: Record<string, SignMeaning> = {
  aries: {
    name: 'Koç',
    locative: "Koç'ta",
    themes: 'cesaret, girişkenlik, enerji ve bağımsızlık',
    style: 'harekete geçme, ilk adımı atma ve doğrudan davranma eğiliminde olabilir.',
  },
  taurus: {
    name: 'Boğa',
    locative: "Boğa'da",
    themes: 'istikrar, güven, sabır ve konfor',
    style: 'sakin ve kararlı davranma, acele etmeme ve kalıcı olanı arama eğiliminde olabilir.',
  },
  gemini: {
    name: 'İkizler',
    locative: "İkizler'de",
    themes: 'merak, iletişim, öğrenme ve hareketlilik',
    style: 'meraklı olma, iletişim kurma ve farklı konulara ilgi duyma eğiliminde olabilir.',
  },
  cancer: {
    name: 'Yengeç',
    locative: "Yengeç'te",
    themes: 'duygusal güven, koruma, aidiyet ve şefkat',
    style: 'güvence arama, sevdiklerini koruma ve duygularıyla hareket etme eğiliminde olabilir.',
  },
  leo: {
    name: 'Aslan',
    locative: "Aslan'da",
    themes: 'kendini ifade etme, yaratıcılık, cömertlik ve özgüven',
    style: 'görünür olma, içten davranma ve yaptığı işe kalbini koyma eğiliminde olabilir.',
  },
  virgo: {
    name: 'Başak',
    locative: "Başak'ta",
    themes: 'düzen, ayrıntı, fayda ve gelişim',
    style: 'dikkatli olma, ayrıntılara önem verme ve işleri düzene sokma eğiliminde olabilir.',
  },
  libra: {
    name: 'Terazi',
    locative: "Terazi'de",
    themes: 'denge, uyum, ilişkiler ve estetik',
    style: 'dengeyi gözetme, başkalarının bakış açısını dikkate alma ve uyum arama eğiliminde olabilir.',
  },
  scorpio: {
    name: 'Akrep',
    locative: "Akrep'te",
    themes: 'derinlik, tutku, dönüşüm ve sezgi',
    style: 'derine inme, yoğun hissetme ve yüzeyde kalmayıp özü arama eğiliminde olabilir.',
  },
  sagittarius: {
    name: 'Yay',
    locative: "Yay'da",
    themes: 'özgürlük, keşif, iyimserlik ve anlam arayışı',
    style: 'ufkunu genişletme, iyimser olma ve yeni deneyimlere açılma eğiliminde olabilir.',
  },
  capricorn: {
    name: 'Oğlak',
    locative: "Oğlak'ta",
    themes: 'sorumluluk, disiplin, hedefler ve sabır',
    style: 'planlı davranma, sorumluluk alma ve uzun vadeyi düşünme eğiliminde olabilir.',
  },
  aquarius: {
    name: 'Kova',
    locative: "Kova'da",
    themes: 'özgünlük, yenilik, bağımsızlık ve topluluk',
    style: 'farklı düşünme, kendi yolunu çizme ve yeniliklere açık olma eğiliminde olabilir.',
  },
  pisces: {
    name: 'Balık',
    locative: "Balık'ta",
    themes: 'sezgi, hayal gücü, empati ve duyarlılık',
    style: 'sezgilerine güvenme, empati kurma ve hayal gücünü kullanma eğiliminde olabilir.',
  },
}; 