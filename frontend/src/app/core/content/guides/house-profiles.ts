/**
 * 12 evin merkezi bilgileri ve ev sayfalarındaki kart metinleri.
 * Bir evin içeriğini değiştirmek için sadece bu dosyaya bakmak yeterlidir.
 * (Sayfa başlığı, giriş ve "Neyi Temsil Eder?" paragrafları house-guides.ts'te.)
 *
 * Dil temkinlidir: "ilişkilendirilir", "işaret edebilir", "ipuçları verebilir".
 */

export type HouseGroup = 'angular' | 'succedent' | 'cadent';

export const HOUSE_GROUPS: Record<HouseGroup, string> = {
  angular: 'Köşe Evi',
  succedent: 'Ardıl Ev',
  cadent: 'Düşen Ev',
};

/** Kartlardaki kısa örnek: "Terazi'de başlıyorsa" -> "uyum ve denge" */
export interface HouseExample {
  when: string;
  meaning: string;
}

export interface HouseProfile {
  number: number; // 7
  slug: string; // "7-ev"
  roman: string; // "VII"
  naturalSign: string; // doğal burcun adresi: "terazi" (sign-profiles.ts'teki slug)
  group: HouseGroup;
  angle?: string; // köşe evlerinin başlangıç noktası: "Alçalan (DSC)"
  oppositeTheme: string; // karşıt ev çiftinin teması: "ben ve biz"
  about: string; // karşıt ev cümlesinde bu evin anlattığı
  themes: string[]; // "Temel Temalar" kartı (6 etiket, kısa: tek satıra sığsın)
  areas: string[]; // "Hayatta Karşılığı" kartı (6 etiket)
  cuspText: string; // "Başladığı Burç" kartı
  cuspExamples: HouseExample[]; // 2 örnek
  planetsText: string; // "İçindeki Gezegenler" kartı
  planetExamples: HouseExample[]; // 2 örnek
}

export const HOUSE_PROFILES: HouseProfile[] = [
  {
    number: 1,
    slug: '1-ev',
    roman: 'I',
    naturalSign: 'koc',
    group: 'angular',
    angle: 'Yükselen (ASC)',
    oppositeTheme: 'ben ve biz',
    about: 'seni ve kendini dünyaya nasıl gösterdiğini',
    themes: ['Benlik', 'Kimlik', 'Kişisel Tarz', 'Başlangıçlar', 'Hayata Yaklaşım', 'Öz İfade'],
    areas: ['Dış Görünüş', 'İlk İzlenim', 'Beden', 'Yüz ve Duruş', 'Yeni Ortamlar', 'Kişisel İmaj'],
    cuspText:
      '1. evin başladığı burç yükselen burçtur ve kişinin kendini dünyaya nasıl sunduğuna renk verebilir.',
    cuspExamples: [
      { when: "Koç'ta başlıyorsa", meaning: 'doğrudan ve enerjik bir duruş' },
      { when: "Terazi'de başlıyorsa", meaning: 'uyumlu ve nazik bir duruş' },
    ],
    planetsText:
      '1. evdeki gezegenler kişiliğin en görünür yanlarıyla ilişkilendirilir; başkaları bu gezegenlerin temalarını kişide ilk bakışta fark edebilir.',
    planetExamples: [
      { when: 'Mars buradaysa', meaning: 'girişken ve enerjik bir duruş' },
      { when: 'Venüs buradaysa', meaning: 'sıcak ve çekici bir ilk izlenim' },
    ],
  },
  {
    number: 2,
    slug: '2-ev',
    roman: 'II',
    naturalSign: 'boga',
    group: 'succedent',
    oppositeTheme: 'benim olan ve bizim olan',
    about: 'kendi kaynaklarını',
    themes: ['Değerler', 'Öz Değer', 'Maddi Güven', 'Yetenekler', 'Harcama Tarzı', 'Konfor'],
    areas: ['Para', 'Gelir', 'Sahip Olunanlar', 'Birikim', 'Eşyalar', 'Kazanç Yolları'],
    cuspText:
      '2. evin başladığı burç, kişinin para kazanma, harcama ve güvende hissetme tarzına dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Boğa'da başlıyorsa", meaning: 'istikrar ve birikim' },
      { when: "Yay'da başlıyorsa", meaning: 'cömertlik ve risk alma' },
    ],
    planetsText:
      '2. evdeki gezegenler, kaynaklar ve değerler konusunun hayatta ne kadar önemli olduğuna ve bu alanda nasıl davranıldığına işaret edebilir.',
    planetExamples: [
      { when: 'Jüpiter buradaysa', meaning: 'kaynakları büyütme isteği' },
      { when: 'Satürn buradaysa', meaning: 'temkinli ve planlı harcama' },
    ],
  },
  {
    number: 3,
    slug: '3-ev',
    roman: 'III',
    naturalSign: 'ikizler',
    group: 'cadent',
    oppositeTheme: 'yakın ve uzak',
    about: 'yakın çevreden ve günlük bilgiden öğrenmeyi',
    themes: ['İletişim', 'Öğrenme', 'Düşünce Tarzı', 'Merak', 'Fikir Alışverişi', 'Uyum Sağlama'],
    areas: ['Kardeşler', 'Komşular', 'Kısa Yolculuklar', 'Yazışmalar', 'Okul Yılları', 'Yakın Çevre'],
    cuspText:
      '3. evin başladığı burç, kişinin konuşma, düşünme ve öğrenme biçimine dair ipuçları verebilir.',
    cuspExamples: [
      { when: "İkizler'de başlıyorsa", meaning: 'hızlı ve meraklı bir iletişim' },
      { when: "Oğlak'ta başlıyorsa", meaning: 'ölçülü ve planlı bir iletişim' },
    ],
    planetsText:
      '3. evdeki gezegenler, iletişim ve yakın çevreyle ilgili konuları öne çıkarabilir; kişinin günlük konuşmalarına ve öğrenme isteğine yansıyabilir.',
    planetExamples: [
      { when: 'Merkür buradaysa', meaning: 'canlı bir zihin ve konuşkanlık' },
      { when: 'Ay buradaysa', meaning: 'duygularla renklenen iletişim' },
    ],
  },
  {
    number: 4,
    slug: '4-ev',
    roman: 'IV',
    naturalSign: 'yengec',
    group: 'angular',
    angle: 'Gökyüzünün Dibi (IC)',
    oppositeTheme: 'ev ve dünya',
    about: 'özel hayatı ve kökleri',
    themes: ['Kökler', 'Aidiyet', 'Güven Alanı', 'Özel Hayat', 'Duygusal Temel', 'Geçmiş'],
    areas: ['Ev', 'Aile', 'Ebeveynler', 'Çocukluk', 'Yuva', 'Doğduğun Yer'],
    cuspText:
      '4. evin başladığı burç, kişinin yuva kavramına ve aileyle kurduğu bağa renk verebilir.',
    cuspExamples: [
      { when: "Yengeç'te başlıyorsa", meaning: 'sıcak ve koruyucu bir yuva' },
      { when: "Kova'da başlıyorsa", meaning: 'özgür ve alışılmışın dışında bir yaşam alanı' },
    ],
    planetsText:
      '4. evdeki gezegenler aile, ev ve geçmişle ilgili konuları belirginleştirebilir; kişinin iç dünyasındaki güven duygusuyla ilişkilendirilir.',
    planetExamples: [
      { when: 'Ay buradaysa', meaning: 'yuvaya ve aileye güçlü bağlılık' },
      { when: 'Satürn buradaysa', meaning: 'aile içinde erken sorumluluk' },
    ],
  },
  {
    number: 5,
    slug: '5-ev',
    roman: 'V',
    naturalSign: 'aslan',
    group: 'succedent',
    oppositeTheme: 'kendim için ve herkes için',
    about: 'kişisel yaratıcılığı ve keyfi',
    themes: ['Yaratıcılık', 'Kendini İfade', 'Eğlence', 'Oyun', 'Keyif', 'Cesaret'],
    areas: ['Aşk', 'Flört', 'Hobiler', 'Çocuklar', 'Sanat', 'Sahne'],
    cuspText:
      '5. evin başladığı burç, kişinin nasıl eğlendiğine, sevdiğine ve bir şey yarattığına dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Aslan'da başlıyorsa", meaning: 'gösterişli ve içten bir ifade' },
      { when: "Başak'ta başlıyorsa", meaning: 'seçici ve emek isteyen hobiler' },
    ],
    planetsText:
      '5. evdeki gezegenler, yaratıcılık, aşk ve keyif konularını hayatın daha görünür bir parçası hâline getirebilir.',
    planetExamples: [
      { when: 'Güneş buradaysa', meaning: 'parlama ve kendini ifade isteği' },
      { when: 'Venüs buradaysa', meaning: 'aşka ve sanata yatkınlık' },
    ],
  },
  {
    number: 6,
    slug: '6-ev',
    roman: 'VI',
    naturalSign: 'basak',
    group: 'cadent',
    oppositeTheme: 'çalışma ve dinlenme',
    about: 'günlük işleri ve düzeni',
    themes: ['Günlük Rutin', 'Alışkanlıklar', 'Düzen', 'Hizmet', 'Verimlilik', 'Beden Bakımı'],
    areas: ['Çalışma Hayatı', 'İş Arkadaşları', 'Görevler', 'İş Ortamı', 'Sağlıklı Yaşam', 'Evcil Hayvanlar'],
    cuspText:
      '6. evin başladığı burç, kişinin çalışma tarzına ve günlük düzenini kurma biçimine dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Başak'ta başlıyorsa", meaning: 'düzenli ve ayrıntıcı bir çalışma' },
      { when: "Koç'ta başlıyorsa", meaning: 'hızlı ve bağımsız bir çalışma' },
    ],
    planetsText:
      '6. evdeki gezegenler, iş ortamı ve günlük alışkanlıklarla ilgili konuları öne çıkarabilir; kişinin her günkü emeğine yansıyabilir.',
    planetExamples: [
      { when: 'Merkür buradaysa', meaning: 'titiz ve verimli bir iş düzeni' },
      { when: 'Mars buradaysa', meaning: 'yoğun ve hızlı bir iş temposu' },
    ],
  },
  {
    number: 7,
    slug: '7-ev',
    roman: 'VII',
    naturalSign: 'terazi',
    group: 'angular',
    angle: 'Alçalan (DSC)',
    oppositeTheme: 'ben ve biz',
    about: 'karşındaki kişileri ve yakın ilişkilerini',
    themes: ['Ortaklık', 'Denge', 'Uzlaşma', 'Bağlılık', 'Karşılıklılık', 'Karşıdaki Kişi'],
    areas: ['Evlilik', 'Uzun İlişkiler', 'İş Ortaklıkları', 'Birebir Bağlar', 'Sözleşmeler', 'Açık Rakipler'],
    cuspText:
      '7. evin başladığı burç, ilişkilerde nasıl bir enerjiye çekildiğini ve partnerde hangi özellikleri aradığını gösterebilir.',
    cuspExamples: [
      { when: "Terazi'de başlıyorsa", meaning: 'uyum ve denge' },
      { when: "Akrep'te başlıyorsa", meaning: 'derinlik ve bağlılık' },
    ],
    planetsText:
      '7. evdeki gezegenler, ilişkiler ve ortaklıklar alanında hangi temaların öne çıktığını gösterebilir; partner seçimini ve ortaklık kurma biçimini etkileyebilir.',
    planetExamples: [
      { when: 'Venüs buradaysa', meaning: 'uyumlu ve sevgi dolu ilişkiler' },
      { when: 'Satürn buradaysa', meaning: 'ciddi ve uzun soluklu bağlar' },
    ],
  },
  {
    number: 8,
    slug: '8-ev',
    roman: 'VIII',
    naturalSign: 'akrep',
    group: 'succedent',
    oppositeTheme: 'benim olan ve bizim olan',
    about: 'başkalarıyla paylaşılan kaynakları',
    themes: ['Dönüşüm', 'Güven', 'Yakınlık', 'Sırlar', 'Paylaşım', 'Yeniden Doğuş'],
    areas: ['Ortak Kaynaklar', 'Miras', 'Yatırım', 'Borçlar', 'Ortak Hesaplar', 'Krediler'],
    cuspText:
      '8. evin başladığı burç, kişinin paylaşmaya, güvenmeye ve köklü değişimlere yaklaşımına dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Akrep'te başlıyorsa", meaning: 'yoğun ve tutkulu bir yakınlık' },
      { when: "İkizler'de başlıyorsa", meaning: 'konuşarak kurulan bir yakınlık' },
    ],
    planetsText:
      '8. evdeki gezegenler, derin bağlar ve hayattaki dönüşüm süreçleriyle ilgili temaları belirginleştirebilir.',
    planetExamples: [
      { when: 'Plüton buradaysa', meaning: 'derin dönüşüm deneyimleri' },
      { when: 'Mars buradaysa', meaning: 'yakınlıkta tutku ve yoğunluk' },
    ],
  },
  {
    number: 9,
    slug: '9-ev',
    roman: 'IX',
    naturalSign: 'yay',
    group: 'cadent',
    oppositeTheme: 'yakın ve uzak',
    about: 'uzaklardan ve büyük fikirlerden öğrenmeyi',
    themes: ['İnançlar', 'Felsefe', 'Dünya Görüşü', 'Anlam Arayışı', 'Keşif', 'Bilgelik'],
    areas: ['Yüksek Öğrenim', 'Uzak Yolculuk', 'Yurt Dışı', 'Yayıncılık', 'Öğretmenlik', 'Kültürler'],
    cuspText:
      '9. evin başladığı burç, kişinin anlam arayışına ve öğrenme biçimine dair bir tarz önerebilir.',
    cuspExamples: [
      { when: "Yay'da başlıyorsa", meaning: 'macera ve keşif' },
      { when: "Boğa'da başlıyorsa", meaning: 'somut ve deneyime dayalı öğrenme' },
    ],
    planetsText:
      '9. evdeki gezegenler, yolculuk, eğitim ve inançlarla ilgili konuları hayatta daha belirgin hâle getirebilir.',
    planetExamples: [
      { when: 'Jüpiter buradaysa', meaning: 'öğrenme ve keşif sevgisi' },
      { when: 'Merkür buradaysa', meaning: 'fikirlere ve dillere merak' },
    ],
  },
  {
    number: 10,
    slug: '10-ev',
    roman: 'X',
    naturalSign: 'oglak',
    group: 'angular',
    angle: 'Tepe Noktası (MC)',
    oppositeTheme: 'ev ve dünya',
    about: 'kariyeri ve toplumdaki rolü',
    themes: ['Hedefler', 'Başarı', 'İtibar', 'Otorite', 'Sorumluluk', 'Statü'],
    areas: ['Kariyer', 'Meslek', 'Toplumdaki Rol', 'Yöneticiler', 'Kamusal Hayat', 'İş Dünyası'],
    cuspText:
      '10. evin başladığı burç, kişinin kariyerde ve toplum içinde öne çıkan tarzına dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Oğlak'ta başlıyorsa", meaning: 'sabırlı ve basamak basamak bir ilerleyiş' },
      { when: "Aslan'da başlıyorsa", meaning: 'görünür ve yaratıcı bir ilerleyiş' },
    ],
    planetsText:
      '10. evdeki gezegenler, kariyer ve hedeflerle ilgili temaları öne çıkarabilir; kişinin toplumda nasıl tanındığına yansıyabilir.',
    planetExamples: [
      { when: 'Güneş buradaysa', meaning: 'kariyerde görünür olma isteği' },
      { when: 'Satürn buradaysa', meaning: 'sabırla kurulan bir kariyer' },
    ],
  },
  {
    number: 11,
    slug: '11-ev',
    roman: 'XI',
    naturalSign: 'kova',
    group: 'succedent',
    oppositeTheme: 'kendim için ve herkes için',
    about: 'toplulukları ve ortak hayalleri',
    themes: ['Umutlar', 'Dilekler', 'Ortak Hedefler', 'Dayanışma', 'Gelecek', 'Yenilik'],
    areas: ['Arkadaşlar', 'Sosyal Çevre', 'Topluluklar', 'Gruplar', 'Dernekler', 'Sosyal Ağlar'],
    cuspText:
      '11. evin başladığı burç, kişinin arkadaşlık kurma ve topluluklara katılma biçimine dair bir tarz önerebilir.',
    cuspExamples: [
      { when: "Kova'da başlıyorsa", meaning: 'geniş ve çeşitli bir çevre' },
      { when: "Yengeç'te başlıyorsa", meaning: 'az ama aile gibi yakın dostlar' },
    ],
    planetsText:
      '11. evdeki gezegenler, sosyal çevre ve gelecek hayalleriyle ilgili konuları hayatta daha görünür kılabilir.',
    planetExamples: [
      { when: 'Uranüs buradaysa', meaning: 'sıra dışı ve özgür arkadaşlıklar' },
      { when: 'Jüpiter buradaysa', meaning: 'geniş ve destekleyici bir çevre' },
    ],
  },
  {
    number: 12,
    slug: '12-ev',
    roman: 'XII',
    naturalSign: 'balik',
    group: 'cadent',
    oppositeTheme: 'çalışma ve dinlenme',
    about: 'iç dünyayı ve dinlenmeyi',
    themes: ['İç Dünya', 'Bilinçdışı', 'Sezgiler', 'Maneviyat', 'Şefkat', 'Kapanışlar'],
    areas: ['Rüyalar', 'Yalnız Zamanlar', 'İnziva', 'Gizli Konular', 'Sessiz Mekânlar', 'Gönüllülük'],
    cuspText:
      '12. evin başladığı burç, kişinin iç dünyasına ve kendini dinleme biçimine dair ipuçları verebilir.',
    cuspExamples: [
      { when: "Balık'ta başlıyorsa", meaning: 'hayal gücü ve empati' },
      { when: "Başak'ta başlıyorsa", meaning: 'iç düzeni sağlama isteği' },
    ],
    planetsText:
      '12. evdeki gezegenler, çoğu zaman kişinin içinde yaşadığı ama dışa pek yansıtmadığı yanlarla ilişkilendirilir.',
    planetExamples: [
      { when: 'Neptün buradaysa', meaning: 'güçlü hayal gücü ve sezgiler' },
      { when: 'Ay buradaysa', meaning: 'duyguları içte yaşama eğilimi' },
    ],
  },
];

/** Adrese göre ev profili (yoksa undefined) */
export function findHouseProfile(slug: string | null | undefined): HouseProfile | undefined {
  return HOUSE_PROFILES.find((house) => house.slug === slug);
}

/** Karşıt ev: 1 <-> 7, 2 <-> 8 ... */
export function oppositeHouse(house: HouseProfile): HouseProfile {
  return HOUSE_PROFILES[(house.number + 5) % 12];
}

/** "Karşıt Ev" kartının metni (iki evin profilinden üretilir) */
export function oppositeText(house: HouseProfile): string {
  const other = oppositeHouse(house);
  return (
    `${house.number}. ev ${house.about}, karşısındaki ${other.number}. ev ise ${other.about} anlatır. ` +
    `İkisi birlikte "${house.oppositeTheme}" dengesini oluşturur.`
  );
}