/**
 * 12 burcun merkezi bilgileri ve burç sayfalarındaki tüm kart metinleri.
 * Bir burcun içeriğini değiştirmek için sadece bu dosyaya bakmak yeterlidir.
 *
 * Element, nitelik ve yönetici gezegen açıklamaları iki katmanlıdır:
 *   1. cümle -> ELEMENTS / MODALITIES / PLANETS içindeki genel anlam (ortak)
 *   2. cümle -> her burcun kendi profilindeki "...InSign" metni (burca özel)
 * Kart metni bu ikisi birleştirilerek oluşturulur (elementText / modalityText / rulerText).
 *
 * Dil temkinlidir: "ilişkilendirilir", "ortaya çıkabilir", "eğilim".
 */

export type ElementKey = 'fire' | 'earth' | 'air' | 'water';
export type ModalityKey = 'cardinal' | 'fixed' | 'mutable';
export type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

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

interface Planet {
  name: string; // "Venüs"
  base?: string; // genel anlam (1. cümle); sadece geleneksel yöneticilerde gerekir
}

export const PLANETS: Record<PlanetKey, Planet> = {
  sun: {
    name: 'Güneş',
    base: 'Güneş; kimlik, yaşam enerjisi, kendini ifade etme ve öz güven temalarıyla ilişkilendirilir.',
  },
  moon: {
    name: 'Ay',
    base: 'Ay; duygular, güvenlik ihtiyacı, alışkanlıklar ve içgüdüsel tepkilerle ilişkilendirilir.',
  },
  mercury: {
    name: 'Merkür',
    base: 'Merkür; düşünme, iletişim, öğrenme ve bilgiyi işleme biçimiyle ilişkilendirilir.',
  },
  venus: {
    name: 'Venüs',
    base: 'Venüs; sevgi, uyum, güzellik, değerler ve keyif alma temalarıyla ilişkilendirilir.',
  },
  mars: {
    name: 'Mars',
    base: 'Mars; enerji, istek, cesaret, mücadele ve harekete geçme gücüyle ilişkilendirilir.',
  },
  jupiter: {
    name: 'Jüpiter',
    base: 'Jüpiter; büyüme, iyimserlik, anlam arayışı ve fırsatlarla ilişkilendirilir.',
  },
  saturn: {
    name: 'Satürn',
    base: 'Satürn; sorumluluk, disiplin, sınırlar, zaman ve kalıcı yapılar kurmakla ilişkilendirilir.',
  },
  uranus: { name: 'Uranüs' },
  neptune: { name: 'Neptün' },
  pluto: { name: 'Plüton' },
};

/** "Doğum Haritanda Boğa" bölümündeki 4 kart */
export interface SignInChart {
  sun: string; // Güneş bu burçtaysa
  moon: string; // Ay bu burçtaysa
  rising: string; // yükselen bu burçsa
  houses: string; // bu burç bir evdeyse
}

export interface SignProfile {
  slug: string; // adres: "boga"
  name: string; // "Boğa"
  locative: string; // "Boğa'da" (kart başlıkları için: "Güneş Boğa'da")
  glyph: string; // "♉"
  dates: string; // "20 Nisan – 20 Mayıs" (yaklaşık)
  element: ElementKey;
  modality: ModalityKey;
  ruler: PlanetKey; // geleneksel yönetici
  modernRuler?: PlanetKey; // modern astrolojideki yönetici (Akrep, Kova, Balık)
  elementInSign: string; // elementin bu burçta nasıl ortaya çıktığı (2. cümle)
  modalityInSign: string; // niteliğin bu burçta nasıl ortaya çıktığı (2. cümle)
  rulerInSign: string; // yönetici gezegenin bu burçta nasıl görüldüğü (2. cümle)
  strengths: string[]; // "Güçlü Yönleri" etiketleri
  cautions: string[]; // "Dikkat Edilmesi Gerekenler" etiketleri (kısa tutulur: kartta tek satıra sığsın)
  inChart: SignInChart;
}

export const SIGN_PROFILES: SignProfile[] = [
  {
    slug: 'koc',
    name: 'Koç',
    locative: "Koç'ta",
    glyph: '♈',
    dates: '21 Mart – 19 Nisan',
    element: 'fire',
    modality: 'cardinal',
    ruler: 'mars',
    elementInSign:
      "Koç'ta bu enerji, ilk adımı atma, rekabetten güç alma ve heyecanla harekete geçme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Koç'ta bu özellik, yeni işlere öncülük etme, hızlı karar verme ve beklemek yerine başlatmayı tercih etme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Koç'ta Mars'ın etkisi, hızlı karar alma, doğrudan konuşma ve zorluklar karşısında geri adım atmama eğilimi olarak görülebilir.",
    strengths: ['Cesur', 'Girişken', 'Enerjik', 'Kararlı', 'Dürüst', 'Öncü'],
    cautions: ['Sabırsızlık', 'Acelecilik', 'Öfke Patlaması', 'Aşırı Rekabet', 'Yarım Bırakma', 'Ani Tepkiler'],
    inChart: {
      sun: 'Kimliğinde cesaret, girişkenlik ve öncülük öne çıkabilir.',
      moon: 'Duygular hızlı ve doğrudan yaşanabilir; tepkiler çabuk gelip çabuk geçebilir.',
      rising: 'Dışarıya enerjik, kararlı ve doğrudan bir ilk izlenim verebilir.',
      houses:
        "Koç'un bulunduğu ev, harekete geçmekten ve ilk adımı atmaktan çekinmediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'boga',
    name: 'Boğa',
    locative: "Boğa'da",
    glyph: '♉',
    dates: '20 Nisan – 20 Mayıs',
    element: 'earth',
    modality: 'fixed',
    ruler: 'venus',
    elementInSign:
      "Boğa'da bu enerji, güvenli ve sağlam bir yaşam kurma, konforu koruma ve somut sonuçlara önem verme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Boğa'da bu özellik, güvenli olanı koruma, başladığı şeyleri sürdürme ve değişime karşı temkinli yaklaşma eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Boğa'da Venüs'ün etkisi, güzelliği ve konforu somut biçimde yaşama, doğadan ve duyulara hitap eden şeylerden keyif alma eğilimi olarak görülebilir.",
    strengths: ['Sabırlı', 'Güvenilir', 'Kararlı', 'Pratik', 'Sadık', 'Dayanıklı'],
    cautions: ['İnatçılık', 'Değişime Direnç', 'Aşırı Rahatlık', 'Kıskançlık', 'Sahiplenme', 'Katılık'],
    inChart: {
      sun: 'Kimliğinde istikrar, güvenilirlik ve kararlılık öne çıkabilir.',
      moon: 'Duygusal güven; huzurlu bir ortam, rutinler ve fiziksel rahatlık üzerinden aranabilir.',
      rising: 'Dışarıya sakin, güven veren ve istikrarlı bir ilk izlenim verebilir.',
      houses:
        "Boğa'nın bulunduğu ev, güven ve istikrar aradığın, sabırla emek verdiğin alana işaret edebilir.",
    },
  },
  {
    slug: 'ikizler',
    name: 'İkizler',
    locative: "İkizler'de",
    glyph: '♊',
    dates: '21 Mayıs – 20 Haziran',
    element: 'air',
    modality: 'mutable',
    ruler: 'mercury',
    elementInSign:
      "İkizler'de bu enerji, merak, soru sorma, bilgi toplama ve farklı insanlarla sohbet ederek öğrenme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "İkizler'de bu özellik, aynı anda birden fazla konuya ilgi duyma, ortama hızla uyum sağlama ve fikir değiştirmeye açık olma şeklinde ortaya çıkabilir.",
    rulerInSign:
      "İkizler'de Merkür'ün etkisi, hızlı düşünme, kelimelerle oynamayı sevme ve aynı anda pek çok bilgiyle ilgilenme eğilimi olarak görülebilir.",
    strengths: ['Meraklı', 'Konuşkan', 'Uyumlu', 'Esprili', 'Çok Yönlü', 'Hızlı Öğrenen'],
    cautions: ['Dağınık Dikkat', 'Kararsızlık', 'Yüzeysel Kalma', 'Huzursuzluk', 'Fazla Düşünme', 'Odak Sorunu'],
    inChart: {
      sun: 'Kimliğinde merak, iletişim ve öğrenme isteği öne çıkabilir.',
      moon: 'Duygular konuşarak, yazarak ve paylaşarak anlamlandırılabilir.',
      rising: 'Dışarıya canlı, meraklı ve sohbete açık bir ilk izlenim verebilir.',
      houses:
        "İkizler'in bulunduğu ev, merak ettiğin, soru sorduğun ve çeşitlilik aradığın alana işaret edebilir.",
    },
  },
  {
    slug: 'yengec',
    name: 'Yengeç',
    locative: "Yengeç'te",
    glyph: '♋',
    dates: '21 Haziran – 22 Temmuz',
    element: 'water',
    modality: 'cardinal',
    ruler: 'moon',
    elementInSign:
      "Yengeç'te bu enerji, sevdiklerini koruma, aidiyet arama ve duygusal olarak güvenli bir ortam yaratma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Yengeç'te bu özellik, duygusal ihtiyaçlar söz konusu olduğunda ilk adımı atma ve yakın bir çevre kurmaya öncülük etme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Yengeç'te Ay'ın etkisi, duygulara ve geçmişe bağlılık, sevdiklerini besleme ve koruma isteği olarak görülebilir.",
    strengths: ['Şefkatli', 'Koruyucu', 'Sezgili', 'Sadık', 'Duyarlı', 'Aile Odaklı'],
    cautions: ['Alınganlık', 'Kabuğuna Çekilme', 'Geçmişe Takılma', 'Duygu Dalgası', 'Aşırı Koruma', 'Değişim Korkusu'],
    inChart: {
      sun: 'Kimliğinde koruyuculuk, şefkat ve aidiyet ihtiyacı öne çıkabilir.',
      moon: 'Ay kendi burcunda olduğu için duygusal ihtiyaçlar ve sezgiler belirgin hâle gelebilir.',
      rising: 'Dışarıya sıcak, anlayışlı ve şefkatli bir ilk izlenim verebilir.',
      houses:
        "Yengeç'in bulunduğu ev, güvende hissetmek istediğin ve duygusal olarak bağlandığın alana işaret edebilir.",
    },
  },
  {
    slug: 'aslan',
    name: 'Aslan',
    locative: "Aslan'da",
    glyph: '♌',
    dates: '23 Temmuz – 22 Ağustos',
    element: 'fire',
    modality: 'fixed',
    ruler: 'sun',
    elementInSign:
      "Aslan'da bu enerji, yaratıcılığını görünür kılma, çevresine sıcaklık yayma ve sahnede olmaktan keyif alma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Aslan'da bu özellik, sevdiklerine ve değerlerine sadık kalma, kalbini koyduğu işi sonuna kadar sürdürme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Aslan'da Güneş'in etkisi, kendini içtenlikle ifade etme, cömert davranma ve yaptığı işte iz bırakma isteği olarak görülebilir.",
    strengths: ['Cömert', 'Özgüvenli', 'Yaratıcı', 'Sadık', 'Sıcak', 'Lider Ruhlu'],
    cautions: ['Gurur', 'Takdir Bekleme', 'İnatçılık', 'İlgi Bekleme', 'Alınganlık', 'Kontrol İsteği'],
    inChart: {
      sun: 'Güneş kendi burcunda olduğu için kimlik ve kendini ifade etme konuları belirgin hâle gelebilir.',
      moon: 'Duygular coşkulu ve içten yaşanabilir; sevildiğini ve görüldüğünü hissetmek önemli olabilir.',
      rising: 'Dışarıya sıcak, özgüvenli ve dikkat çeken bir ilk izlenim verebilir.',
      houses:
        "Aslan'ın bulunduğu ev, parlamak, yaratmak ve kendini göstermek istediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'basak',
    name: 'Başak',
    locative: "Başak'ta",
    glyph: '♍',
    dates: '23 Ağustos – 22 Eylül',
    element: 'earth',
    modality: 'mutable',
    ruler: 'mercury',
    elementInSign:
      "Başak'ta bu enerji, ayrıntılara dikkat etme, işleri düzene koyma ve somut olarak faydalı olma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Başak'ta bu özellik, planları koşullara göre gözden geçirme, sürekli iyileştirme arama ve yöntemlerini ihtiyaca göre uyarlama şeklinde ortaya çıkabilir.",
    rulerInSign:
      "Başak'ta Merkür'ün etkisi, analiz etme, ayrıntıları fark etme ve bilgiyi pratik bir işe dönüştürme eğilimi olarak görülebilir.",
    strengths: ['Dikkatli', 'Çalışkan', 'Düzenli', 'Yardımsever', 'Analitik', 'Pratik'],
    cautions: ['Mükemmeliyetçilik', 'Eleştirellik', 'Kaygı', 'Öz Eleştiri', 'Detaycılık', 'Rahatlayamama'],
    inChart: {
      sun: 'Kimliğinde emek, düzen ve faydalı olma isteği öne çıkabilir.',
      moon: 'Duygusal rahatlık; düzenli bir ortam ve işleri yoluna koymak üzerinden aranabilir.',
      rising: 'Dışarıya dikkatli, ölçülü ve yardımsever bir ilk izlenim verebilir.',
      houses:
        "Başak'ın bulunduğu ev, düzen kurmak, geliştirmek ve özenle çalışmak istediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'terazi',
    name: 'Terazi',
    locative: "Terazi'de",
    glyph: '♎',
    dates: '23 Eylül – 22 Ekim',
    element: 'air',
    modality: 'cardinal',
    ruler: 'venus',
    elementInSign:
      "Terazi'de bu enerji, farklı bakış açılarını tartma, diplomatik bir dil kullanma ve ilişkilerde karşılıklılık arama şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Terazi'de bu özellik, ilişkileri başlatma, insanları bir araya getirme ve uyumu sağlamak için harekete geçme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Terazi'de Venüs'ün etkisi, ilişkilerde uyum arama, estetiğe değer verme ve adil olmaya çalışma eğilimi olarak görülebilir.",
    strengths: ['Diplomatik', 'Nazik', 'Adil', 'Uyumlu', 'Zarif', 'İş Birlikçi'],
    cautions: ['Kararsızlık', 'Çatışmadan Kaçma', 'Onay Bekleme', 'Hayır Diyememe', 'Kendini Unutma', 'Yüzeysel Uyum'],
    inChart: {
      sun: 'Kimliğinde ilişkiler, denge ve uyum arayışı öne çıkabilir.',
      moon: 'Duygusal denge; huzurlu ve karşılıklı ilişkiler üzerinden aranabilir.',
      rising: 'Dışarıya nazik, zarif ve uyumlu bir ilk izlenim verebilir.',
      houses:
        "Terazi'nin bulunduğu ev, denge ve iş birliği aradığın, başkalarıyla birlikte hareket ettiğin alana işaret edebilir.",
    },
  },
  {
    slug: 'akrep',
    name: 'Akrep',
    locative: "Akrep'te",
    glyph: '♏',
    dates: '23 Ekim – 21 Kasım',
    element: 'water',
    modality: 'fixed',
    ruler: 'mars',
    modernRuler: 'pluto',
    elementInSign:
      "Akrep'te bu enerji, yoğun hissetme, yüzeyin altında kalanı merak etme ve güvendiği kişilerle derin bağlar kurma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Akrep'te bu özellik, bir kez bağlandığında kolay vazgeçmeme, hedefine odaklanma ve duygularını uzun süre taşıma eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Akrep'te Mars'ın etkisi kararlılık ve mücadele gücü olarak, modern astrolojide Plüton'un etkisi ise dönüşüm ve yeniden doğuş temaları olarak görülebilir.",
    strengths: ['Tutkulu', 'Kararlı', 'Sezgili', 'Sadık', 'Derin', 'Cesur'],
    cautions: ['Kıskançlık', 'Kolay Güvenmeme', 'Kin Tutma', 'Kontrol İsteği', 'Aşırı Gizlilik', 'Aşırı Yoğunluk'],
    inChart: {
      sun: 'Kimliğinde derinlik, kararlılık ve tutku öne çıkabilir.',
      moon: 'Duygular yoğun ama içe dönük yaşanabilir; güven kolay verilmeyebilir.',
      rising: 'Dışarıya gizemli, dikkatli ve etkileyici bir ilk izlenim verebilir.',
      houses:
        "Akrep'in bulunduğu ev, derinleşmek, dönüşmek ve tüm kalbinle bağlanmak istediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'yay',
    name: 'Yay',
    locative: "Yay'da",
    glyph: '♐',
    dates: '22 Kasım – 21 Aralık',
    element: 'fire',
    modality: 'mutable',
    ruler: 'jupiter',
    elementInSign:
      "Yay'da bu enerji, keşfetme, öğrenme, özgürlük arayışı ve yeni deneyimlere yönelme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Yay'da bu özellik, yeni fikirlere ve deneyimlere açık olma, farklı bakış açılarını keşfetme ve koşullara göre yön değiştirebilme şeklinde ortaya çıkabilir.",
    rulerInSign:
      "Yay'da Jüpiter'in etkisi, iyimserlik, ufkunu genişletme ve hayatta bir anlam arama isteği olarak görülebilir.",
    strengths: ['İyimser', 'Özgür Ruhlu', 'Maceracı', 'Dürüst', 'Neşeli', 'Açık Fikirli'],
    cautions: ['Sabırsızlık', 'Pervasız Sözler', 'Bağlanma Korkusu', 'Abartma', 'Dağınıklık', 'Söz Verip Unutma'],
    inChart: {
      sun: 'Kimliğinde keşif, iyimserlik ve özgürlük isteği öne çıkabilir.',
      moon: 'Duygusal rahatlık; özgür hissetmek ve yeni şeyler yaşamak üzerinden aranabilir.',
      rising: 'Dışarıya neşeli, açık sözlü ve maceracı bir ilk izlenim verebilir.',
      houses:
        "Yay'ın bulunduğu ev, keşfetmek, öğrenmek ve ufkunu genişletmek istediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'oglak',
    name: 'Oğlak',
    locative: "Oğlak'ta",
    glyph: '♑',
    dates: '22 Aralık – 19 Ocak',
    element: 'earth',
    modality: 'cardinal',
    ruler: 'saturn',
    elementInSign:
      "Oğlak'ta bu enerji, uzun vadeli hedefler koyma, sorumluluk alma ve emeğin zamanla karşılığını görme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Oğlak'ta bu özellik, plan yapıp ilk adımı atma, sağlam bir yapı kurma ve başkalarına yol gösterme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Oğlak'ta Satürn'ün etkisi, disiplin, sabır ve emeğiyle kalıcı bir şey inşa etme isteği olarak görülebilir.",
    strengths: ['Disiplinli', 'Sorumlu', 'Sabırlı', 'Gerçekçi', 'Hırslı', 'Güvenilir'],
    cautions: ['Aşırı Ciddiyet', 'Duygu Bastırma', 'İşkoliklik', 'Katılık', 'Kötümserlik', 'Aşırı Yük Alma'],
    inChart: {
      sun: 'Kimliğinde kararlılık, sorumluluk ve hedef odaklılık öne çıkabilir.',
      moon: 'Duygular kontrollü ve ölçülü yaşanabilir; güven, düzen ve öngörülebilirlik üzerinden aranabilir.',
      rising: 'Dışarıya ciddi, güvenilir ve olgun bir ilk izlenim verebilir.',
      houses:
        "Oğlak'ın bulunduğu ev, sorumluluk aldığın ve uzun vadeli hedefler kurduğun alana işaret edebilir.",
    },
  },
  {
    slug: 'kova',
    name: 'Kova',
    locative: "Kova'da",
    glyph: '♒',
    dates: '20 Ocak – 18 Şubat',
    element: 'air',
    modality: 'fixed',
    ruler: 'saturn',
    modernRuler: 'uranus',
    elementInSign:
      "Kova'da bu enerji, alışılmışın dışında düşünme, fikirlerini toplulukla paylaşma ve geleceğe dair yeni fikirler üretme şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Kova'da bu özellik, inandığı fikirlere ve ilkelere bağlı kalma, kendi yolundan kolayca dönmeme eğilimiyle ortaya çıkabilir.",
    rulerInSign:
      "Kova'da Satürn'ün etkisi ilkelere bağlılık olarak, modern astrolojide Uranüs'ün etkisi ise yenilik, özgünlük ve beklenmedik fikirler olarak görülebilir.",
    strengths: ['Özgün', 'Yenilikçi', 'Bağımsız', 'Arkadaş Canlısı', 'İdealist', 'Açık Fikirli'],
    cautions: ['Soğuk Görünme', 'İnatçılık', 'Duygusal Mesafe', 'Kural Tanımama', 'Öngörülemezlik', 'Zor Yakınlaşma'],
    inChart: {
      sun: 'Kimliğinde özgünlük, bağımsızlık ve farklı düşünme öne çıkabilir.',
      moon: 'Duygular biraz mesafeyle ve düşünülerek yaşanabilir; kişisel alan önemli olabilir.',
      rising: 'Dışarıya farklı, arkadaş canlısı ve özgür ruhlu bir ilk izlenim verebilir.',
      houses:
        "Kova'nın bulunduğu ev, kalıpların dışına çıkmak ve kendi yolunu çizmek istediğin alana işaret edebilir.",
    },
  },
  {
    slug: 'balik',
    name: 'Balık',
    locative: "Balık'ta",
    glyph: '♓',
    dates: '19 Şubat – 20 Mart',
    element: 'water',
    modality: 'mutable',
    ruler: 'jupiter',
    modernRuler: 'neptune',
    elementInSign:
      "Balık'ta bu enerji, başkalarının duygularını kolayca hissetme, hayal gücüne yönelme ve şefkatle yaklaşma şeklinde ortaya çıkabilir.",
    modalityInSign:
      "Balık'ta bu özellik, akışa bırakabilme, farklı ortamlara ve insanlara kolayca uyum sağlama ve sınırları esnek tutma şeklinde ortaya çıkabilir.",
    rulerInSign:
      "Balık'ta Jüpiter'in etkisi şefkat ve anlam arayışı olarak, modern astrolojide Neptün'ün etkisi ise hayal gücü, sezgi ve maneviyat olarak görülebilir.",
    strengths: ['Şefkatli', 'Sezgili', 'Hayal Gücü Geniş', 'Empatik', 'Yardımsever', 'Sanatsal'],
    cautions: ['Sınır Koyamama', 'Kaçış İsteği', 'Kararsızlık', 'Fazla Fedakârlık', 'Çabuk Etkilenme', 'Dağınıklık'],
    inChart: {
      sun: 'Kimliğinde sezgi, şefkat ve hayal gücü öne çıkabilir.',
      moon: 'Duygular derin yaşanabilir; çevrenin ruh hali kolayca hissedilebilir.',
      rising: 'Dışarıya yumuşak, hayalperest ve anlayışlı bir ilk izlenim verebilir.',
      houses:
        "Balık'ın bulunduğu ev, sezgilerine güvendiğin, hayal kurduğun ve şefkat gösterdiğin alana işaret edebilir.",
    },
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

/** Yönetici gezegen kartının metni: gezegenin genel anlamı + bu burçtaki hali */
export function rulerText(profile: SignProfile): string {
  return `${PLANETS[profile.ruler].base} ${profile.rulerInSign}`;
}

/** Bilgi şeridindeki yönetici adı: "Venüs" veya "Mars (Modern: Plüton)" */
export function rulerName(profile: SignProfile): string {
  const ruler = PLANETS[profile.ruler].name;
  return profile.modernRuler ? `${ruler} (Modern: ${PLANETS[profile.modernRuler].name})` : ruler;
}