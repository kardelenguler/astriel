/**
 * 12 burcun merkezi bilgileri: tarih, sembol, element, nitelik, yönetici gezegen
 * ve element/nitelik kartlarının metinleri.
 *
 * Element ve nitelik açıklamaları iki katmanlıdır:
 *   1. cümle -> ELEMENTS / MODALITIES içindeki genel anlam (aynı elementteki burçlarda ortak)
 *   2. cümle -> her burcun kendi profilindeki "inSign" metni (burca özel)
 * Kart metni bu ikisi birleştirilerek oluşturulur (elementText / modalityText).
 *
 * Dil temkinlidir: "ilişkilendirilir", "ortaya çıkabilir", "eğilim".
 */

export type ElementKey = 'fire' | 'earth' | 'air' | 'water';
export type ModalityKey = 'cardinal' | 'fixed' | 'mutable';

interface Quality {
  name: string; // "Toprak"
  title: string; // kart başlığı: "Toprak Elementi"
  base: string; // genel, değişmeyen anlam (1. cümle)
}

export const ELEMENTS: Record<ElementKey, Quality> = {
  fire: {
    name: 'Ateş',
    title: 'Ateş Elementi',
    base: 'Ateş elementi; enerji, hareket, cesaret, keşif ve kendini ortaya koyma temalarıyla ilişkilendirilir.',
  },
  earth: {
    name: 'Toprak',
    title: 'Toprak Elementi',
    base: 'Toprak elementi; güven, pratiklik, istikrar ve somutluk temalarıyla ilişkilendirilir.',
  },
  air: {
    name: 'Hava',
    title: 'Hava Elementi',
    base: 'Hava elementi; düşünce, iletişim, fikir alışverişi ve ilişki kurma temalarıyla ilişkilendirilir.',
  },
  water: {
    name: 'Su',
    title: 'Su Elementi',
    base: 'Su elementi; duygu, sezgi, empati ve derin bağlar kurma temalarıyla ilişkilendirilir.',
  },
};

export const MODALITIES: Record<ModalityKey, Quality> = {
  cardinal: {
    name: 'Öncü',
    title: 'Öncü Nitelik',
    base: 'Öncü nitelik; başlatma, harekete geçme ve yön belirleme temalarıyla ilişkilendirilir.',
  },
  fixed: {
    name: 'Sabit',
    title: 'Sabit Nitelik',
    base: 'Sabit nitelik; istikrar, süreklilik ve kararlılık temalarıyla ilişkilendirilir.',
  },
  mutable: {
    name: 'Değişken',
    title: 'Değişken Nitelik',
    base: 'Değişken nitelik; uyum, esneklik ve değişime açıklıkla ilişkilendirilir.',
  },
};

export interface SignProfile {
  slug: string; // adres: "boga"
  name: string; // "Boğa"
  glyph: string; // "♉"
  dates: string; // "20 Nisan – 20 Mayıs" (yaklaşık)
  element: ElementKey;
  modality: ModalityKey;
  ruler: string; // "Venüs" veya "Mars (Modern: Plüton)"
  elementInSign: string; // elementin bu burçta nasıl ortaya çıktığı (2. cümle)
  modalityInSign: string; // niteliğin bu burçta nasıl ortaya çıktığı (2. cümle)
}

export const SIGN_PROFILES: SignProfile[] = [
  {
    slug: 'koc',
    name: 'Koç',
    glyph: '♈',
    dates: '21 Mart – 19 Nisan',
    element: 'fire',
    modality: 'cardinal',
    ruler: 'Mars',
    elementInSign:
      "Koç'ta bu enerji, ilk adımı atma, rekabetten güç alma ve heyecanla harekete geçme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Koç'ta bu özellik, yeni işlere öncülük etme, hızlı karar verme ve beklemek yerine başlatmayı tercih etme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'boga',
    name: 'Boğa',
    glyph: '♉',
    dates: '20 Nisan – 20 Mayıs',
    element: 'earth',
    modality: 'fixed',
    ruler: 'Venüs',
    elementInSign:
      "Boğa'da bu enerji, güvenli ve sağlam bir yaşam kurma, konforu koruma ve somut sonuçlara önem verme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Boğa'da bu özellik, güvenli olanı koruma, başladığı şeyleri sürdürme ve değişime karşı temkinli yaklaşma eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'ikizler',
    name: 'İkizler',
    glyph: '♊',
    dates: '21 Mayıs – 20 Haziran',
    element: 'air',
    modality: 'mutable',
    ruler: 'Merkür',
    elementInSign:
      "İkizler'de bu enerji, merak, soru sorma, bilgi toplama ve farklı insanlarla sohbet ederek öğrenme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "İkizler'de bu özellik, aynı anda birden fazla konuya ilgi duyma, ortama hızla uyum sağlama ve fikir değiştirmeye açık olma şeklinde ortaya çıkabilir.",
  },
  {
    slug: 'yengec',
    name: 'Yengeç',
    glyph: '♋',
    dates: '21 Haziran – 22 Temmuz',
    element: 'water',
    modality: 'cardinal',
    ruler: 'Ay',
    elementInSign:
      "Yengeç'te bu enerji, sevdiklerini koruma, aidiyet arama ve duygusal olarak güvenli bir ortam yaratma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Yengeç'te bu özellik, duygusal ihtiyaçlar söz konusu olduğunda ilk adımı atma ve yakın bir çevre kurmaya öncülük etme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'aslan',
    name: 'Aslan',
    glyph: '♌',
    dates: '23 Temmuz – 22 Ağustos',
    element: 'fire',
    modality: 'fixed',
    ruler: 'Güneş',
    elementInSign:
      "Aslan'da bu enerji, yaratıcılığını görünür kılma, çevresine sıcaklık yayma ve sahnede olmaktan keyif alma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Aslan'da bu özellik, sevdiklerine ve değerlerine sadık kalma, kalbini koyduğu işi sonuna kadar sürdürme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'basak',
    name: 'Başak',
    glyph: '♍',
    dates: '23 Ağustos – 22 Eylül',
    element: 'earth',
    modality: 'mutable',
    ruler: 'Merkür',
    elementInSign:
      "Başak'ta bu enerji, ayrıntılara dikkat etme, işleri düzene koyma ve somut olarak faydalı olma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Başak'ta bu özellik, planları koşullara göre gözden geçirme, sürekli iyileştirme arama ve yöntemlerini ihtiyaca göre uyarlama şeklinde ortaya çıkabilir.",
  },
  {
    slug: 'terazi',
    name: 'Terazi',
    glyph: '♎',
    dates: '23 Eylül – 22 Ekim',
    element: 'air',
    modality: 'cardinal',
    ruler: 'Venüs',
    elementInSign:
      "Terazi'de bu enerji, farklı bakış açılarını tartma, diplomatik bir dil kullanma ve ilişkilerde karşılıklılık arama şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Terazi'de bu özellik, ilişkileri başlatma, insanları bir araya getirme ve uyumu sağlamak için harekete geçme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'akrep',
    name: 'Akrep',
    glyph: '♏',
    dates: '23 Ekim – 21 Kasım',
    element: 'water',
    modality: 'fixed',
    ruler: 'Mars (Modern: Plüton)',
    elementInSign:
      "Akrep'te bu enerji, yoğun hissetme, yüzeyin altında kalanı merak etme ve güvendiği kişilerle derin bağlar kurma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Akrep'te bu özellik, bir kez bağlandığında kolay vazgeçmeme, hedefine odaklanma ve duygularını uzun süre taşıma eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'yay',
    name: 'Yay',
    glyph: '♐',
    dates: '22 Kasım – 21 Aralık',
    element: 'fire',
    modality: 'mutable',
    ruler: 'Jüpiter',
    elementInSign:
      "Yay'da bu enerji, keşfetme, öğrenme, özgürlük arayışı ve yeni deneyimlere yönelme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Yay'da bu özellik, yeni fikirlere ve deneyimlere açık olma, farklı bakış açılarını keşfetme ve koşullara göre yön değiştirebilme şeklinde ortaya çıkabilir.",
  },
  {
    slug: 'oglak',
    name: 'Oğlak',
    glyph: '♑',
    dates: '22 Aralık – 19 Ocak',
    element: 'earth',
    modality: 'cardinal',
    ruler: 'Satürn',
    elementInSign:
      "Oğlak'ta bu enerji, uzun vadeli hedefler koyma, sorumluluk alma ve emeğin zamanla karşılığını görme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Oğlak'ta bu özellik, plan yapıp ilk adımı atma, sağlam bir yapı kurma ve başkalarına yol gösterme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'kova',
    name: 'Kova',
    glyph: '♒',
    dates: '20 Ocak – 18 Şubat',
    element: 'air',
    modality: 'fixed',
    ruler: 'Satürn (Modern: Uranüs)',
    elementInSign:
      "Kova'da bu enerji, alışılmışın dışında düşünme, fikirlerini toplulukla paylaşma ve geleceğe dair yeni fikirler üretme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Kova'da bu özellik, inandığı fikirlere ve ilkelere bağlı kalma, kendi yolundan kolayca dönmeme eğilimiyle ortaya çıkabilir.",
  },
  {
    slug: 'balik',
    name: 'Balık',
    glyph: '♓',
    dates: '19 Şubat – 20 Mart',
    element: 'water',
    modality: 'mutable',
    ruler: 'Jüpiter (Modern: Neptün)',
    elementInSign:
      "Balık'ta bu enerji, başkalarının duygularını kolayca hissetme, hayal gücüne yönelme ve şefkatle yaklaşma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Balık'ta bu özellik, akışa bırakabilme, farklı ortamlara ve insanlara kolayca uyum sağlama ve sınırları esnek tutma şeklinde ortaya çıkabilir.",
  },
];

/** Adrese göre burç profili (yoksa undefined) */
export function findSignProfile(slug: string | null | undefined): SignProfile | undefined {
  return SIGN_PROFILES.find((profile) => profile.slug === slug);
}

/** Element kartının metni: genel anlam + bu burçtaki hali */
export function elementText(profile: SignProfile): string {
  return `${ELEMENTS[profile.element].base} ${profile.elementInSign}`;
}

/** Nitelik kartının metni: genel anlam + bu burçtaki hali */
export function modalityText(profile: SignProfile): string {
  return `${MODALITIES[profile.modality].base} ${profile.modalityInSign}`;
}