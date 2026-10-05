import { GuideCollection } from '../../models/guide';

/**
 * 12 burç rehberi: /burclar ve /burclar/koc ... /burclar/balik sayfalarının metinleri.
 * Tarihler yaklaşıktır: Güneş'in burca giriş günü yıldan yıla bir gün oynayabilir.
 * Dil temkinlidir ("ilişkilendirilir", "eğiliminde olabilir"): kesin hüküm verilmez.
 */
export const SIGN_GUIDES: GuideCollection = {
  path: 'burclar',
  eyebrow: 'Astroloji Rehberi',
  title: '12 Burç ve Özellikleri',
  description:
    "Koç'tan Balık'a 12 burcun özellikleri, tarihleri, elementleri ve yönetici gezegenleri. Haritanda Güneş, Ay ve yükselen burcunun anlamını öğren.",
  intro:
    'Zodyak on iki burca bölünür ve her burç kendine özgü bir tarzla ilişkilendirilir. Bir burç yalnızca Güneş burcun değildir: Ay\'ın, yükselenin ve her gezegenin haritanda bulunduğu bir burç vardır.',
  ctaText: 'Haritanda Güneş, Ay ve yükselen hangi burçta? Doğum bilgilerini gir, birkaç saniyede öğren.',
  items: [
    {
      slug: 'koc',
      name: 'Koç',
      tagline: '21 Mart – 19 Nisan · Ateş',
      title: 'Koç Burcu Özellikleri',
      description:
        'Koç burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Koç olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Koç, zodyağın ilk burcudur ve yeni başlangıçlarla ilişkilendirilir. Cesaret, girişkenlik ve enerji bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Koç Burcunun Genel Özellikleri',
          paragraphs: [
            'Koç; harekete geçme, ilk adımı atma ve doğrudan davranma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, beklemek yerine denemeyi ve yeni bir işe heyecanla başlamayı tercih edebilir.',
            'Bağımsızlık ve rekabet de Koç\'un temaları arasında yer alır. Aynı enerji bazen sabırsızlık ya da düşünmeden hareket etme olarak da görünebilir; bu yüzden Koç\'un dengesi, cesaretini sabırla birleştirmekte aranır.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Koç bir ateş burcudur ve öncü (kardinal) niteliktedir. Öncü burçlar, mevsimlerin başladığı burçlardır ve bir şeyi başlatma enerjisiyle ilişkilendirilir. Koç\'un yöneticisi Mars\'tır. Güneş, yaklaşık olarak 21 Mart – 19 Nisan arasında Koç burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Koç Burcu',
          paragraphs: [
            'Güneş Koç\'taysa kişinin kimliğinde girişkenlik ve öncülük öne çıkabilir. Ay Koç\'taysa duygular hızlı ve doğrudan yaşanabilir. Yükselen Koç olan biri ise dışarıya enerjik ve kararlı bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'boga',
      name: 'Boğa',
      tagline: '20 Nisan – 20 Mayıs · Toprak',
      title: 'Boğa Burcu Özellikleri',
      description:
        'Boğa burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Boğa olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Boğa, zodyağın ikinci burcudur ve istikrarla ilişkilendirilir. Güven, sabır ve hayatın somut güzelliklerinden keyif almak bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Boğa Burcunun Genel Özellikleri',
          paragraphs: [
            'Boğa; sakin ve kararlı davranma, acele etmeme ve kalıcı olanı arama eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, bir işe başladıklarında onu sabırla sürdürmeyi ve emeğinin somut karşılığını görmeyi önemseyebilir.',
            'Konfor, doğa, güzel yemekler ve estetik de Boğa\'nın temaları arasında yer alır. Aynı kararlılık bazen değişime direnç ya da inatçılık olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Boğa bir toprak burcudur ve sabit niteliktedir. Sabit burçlar, mevsimlerin ortasına denk gelir ve sürdürme, koruma enerjisiyle ilişkilendirilir. Boğa\'nın yöneticisi Venüs\'tür. Güneş, yaklaşık olarak 20 Nisan – 20 Mayıs arasında Boğa burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Boğa Burcu',
          paragraphs: [
            'Güneş Boğa\'daysa kişinin kimliğinde istikrar ve güvenilirlik öne çıkabilir. Ay Boğa\'daysa duygusal güven; rutinler, huzurlu bir ortam ve fiziksel rahatlık üzerinden aranabilir. Yükselen Boğa olan biri ise dışarıya sakin ve güven veren bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'ikizler',
      name: 'İkizler',
      tagline: '21 Mayıs – 20 Haziran · Hava',
      title: 'İkizler Burcu Özellikleri',
      description:
        'İkizler burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen İkizler olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'İkizler, zodyağın üçüncü burcudur ve merakla ilişkilendirilir. İletişim, öğrenme ve hareketlilik bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'İkizler Burcunun Genel Özellikleri',
          paragraphs: [
            'İkizler; meraklı olma, iletişim kurma ve farklı konulara ilgi duyma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, yeni bilgiler edinmekten, sohbet etmekten ve fikir alışverişinden keyif alabilir.',
            'Uyum sağlama becerisi ve zihinsel çeviklik de İkizler\'in temaları arasında yer alır. Aynı çok yönlülük bazen dikkatin dağılması ya da bir işe uzun süre odaklanmakta zorlanma olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'İkizler bir hava burcudur ve değişken niteliktedir. Değişken burçlar, mevsimlerin sonuna denk gelir ve uyum sağlama, dönüştürme enerjisiyle ilişkilendirilir. İkizler\'in yöneticisi Merkür\'dür. Güneş, yaklaşık olarak 21 Mayıs – 20 Haziran arasında İkizler burcundadır.',
          ],
        },
        {
          heading: 'Haritanda İkizler Burcu',
          paragraphs: [
            'Güneş İkizler\'deyse kişinin kimliğinde merak ve iletişim öne çıkabilir. Ay İkizler\'deyse duygular konuşarak ve paylaşarak anlamlandırılabilir. Yükselen İkizler olan biri ise dışarıya canlı, meraklı ve sohbete açık bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'yengec',
      name: 'Yengeç',
      tagline: '21 Haziran – 22 Temmuz · Su',
      title: 'Yengeç Burcu Özellikleri',
      description:
        'Yengeç burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Yengeç olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Yengeç, zodyağın dördüncü burcudur ve duygusal güvenle ilişkilendirilir. Aile, aidiyet ve şefkat bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Yengeç Burcunun Genel Özellikleri',
          paragraphs: [
            'Yengeç; güvence arama, sevdiklerini koruma ve duygularıyla hareket etme eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, yakın bağlara ve kendini evinde hissettiği ortamlara önem verebilir.',
            'Sezgi, hafıza ve geçmişe bağlılık da Yengeç\'in temaları arasında yer alır. Aynı duyarlılık bazen alınganlık ya da kabuğuna çekilme olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Yengeç bir su burcudur ve öncü (kardinal) niteliktedir. Yengeç\'in yöneticisi Ay\'dır. Güneş, yaklaşık olarak 21 Haziran – 22 Temmuz arasında Yengeç burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Yengeç Burcu',
          paragraphs: [
            'Güneş Yengeç\'teyse kişinin kimliğinde koruyuculuk ve duygusal derinlik öne çıkabilir. Ay Yengeç\'teyse Ay kendi burcunda olduğu için duygusal ihtiyaçlar haritada belirgin hâle gelebilir. Yükselen Yengeç olan biri ise dışarıya sıcak ve şefkatli bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'aslan',
      name: 'Aslan',
      tagline: '23 Temmuz – 22 Ağustos · Ateş',
      title: 'Aslan Burcu Özellikleri',
      description:
        'Aslan burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Aslan olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Aslan, zodyağın beşinci burcudur ve kendini ifade etmekle ilişkilendirilir. Yaratıcılık, cömertlik ve özgüven bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Aslan Burcunun Genel Özellikleri',
          paragraphs: [
            'Aslan; görünür olma, içten davranma ve yaptığı işe kalbini koyma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, yaratıcılıklarını ortaya koymaktan ve sevdiklerine cömert davranmaktan keyif alabilir.',
            'Sadakat, liderlik ve sıcaklık da Aslan\'ın temaları arasında yer alır. Aynı parlaklık bazen takdir edilme ihtiyacı ya da gurur olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Aslan bir ateş burcudur ve sabit niteliktedir. Aslan\'ın yöneticisi Güneş\'tir. Güneş, yaklaşık olarak 23 Temmuz – 22 Ağustos arasında Aslan burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Aslan Burcu',
          paragraphs: [
            'Güneş Aslan\'daysa Güneş kendi burcunda olduğu için kimlik ve kendini ifade etme konuları haritada belirgin hâle gelebilir. Ay Aslan\'daysa duygular coşkulu ve içten yaşanabilir. Yükselen Aslan olan biri ise dışarıya sıcak, özgüvenli ve dikkat çeken bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'basak',
      name: 'Başak',
      tagline: '23 Ağustos – 22 Eylül · Toprak',
      title: 'Başak Burcu Özellikleri',
      description:
        'Başak burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Başak olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Başak, zodyağın altıncı burcudur ve düzenle ilişkilendirilir. Ayrıntılara dikkat, faydalı olmak ve gelişim bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Başak Burcunun Genel Özellikleri',
          paragraphs: [
            'Başak; dikkatli olma, ayrıntılara önem verme ve işleri düzene sokma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, bir işi doğru ve eksiksiz yapmaktan, başkalarına somut olarak yardımcı olmaktan memnuniyet duyabilir.',
            'Analiz, pratiklik ve kendini geliştirme isteği de Başak\'ın temaları arasında yer alır. Aynı titizlik bazen mükemmeliyetçilik ya da kendine fazla yüklenme olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Başak bir toprak burcudur ve değişken niteliktedir. Başak\'ın yöneticisi Merkür\'dür. Güneş, yaklaşık olarak 23 Ağustos – 22 Eylül arasında Başak burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Başak Burcu',
          paragraphs: [
            'Güneş Başak\'taysa kişinin kimliğinde emek, düzen ve faydalı olma isteği öne çıkabilir. Ay Başak\'taysa duygusal rahatlık; düzenli bir ortam ve işleri yoluna koymak üzerinden aranabilir. Yükselen Başak olan biri ise dışarıya dikkatli, ölçülü ve yardımsever bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'terazi',
      name: 'Terazi',
      tagline: '23 Eylül – 22 Ekim · Hava',
      title: 'Terazi Burcu Özellikleri',
      description:
        'Terazi burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Terazi olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Terazi, zodyağın yedinci burcudur ve dengeyle ilişkilendirilir. Uyum, ilişkiler ve estetik bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Terazi Burcunun Genel Özellikleri',
          paragraphs: [
            'Terazi; dengeyi gözetme, başkalarının bakış açısını dikkate alma ve uyum arama eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, adaleti, nezaketi ve iş birliğini önemseyebilir.',
            'Güzellik, sanat ve zarafet de Terazi\'nin temaları arasında yer alır. Aynı denge arayışı bazen kararsızlık ya da çatışmadan kaçınma olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Terazi bir hava burcudur ve öncü (kardinal) niteliktedir. Terazi\'nin yöneticisi Venüs\'tür. Güneş, yaklaşık olarak 23 Eylül – 22 Ekim arasında Terazi burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Terazi Burcu',
          paragraphs: [
            'Güneş Terazi\'deyse kişinin kimliğinde ilişkiler ve uyum öne çıkabilir. Ay Terazi\'deyse duygusal denge, huzurlu ve karşılıklı ilişkiler üzerinden aranabilir. Yükselen Terazi olan biri ise dışarıya nazik, zarif ve uyumlu bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'akrep',
      name: 'Akrep',
      tagline: '23 Ekim – 21 Kasım · Su',
      title: 'Akrep Burcu Özellikleri',
      description:
        'Akrep burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Akrep olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Akrep, zodyağın sekizinci burcudur ve derinlikle ilişkilendirilir. Tutku, dönüşüm ve sezgi bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Akrep Burcunun Genel Özellikleri',
          paragraphs: [
            'Akrep; derine inme, yoğun hissetme ve yüzeyde kalmayıp özü arama eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, güvendikleri insanlara derin bir bağlılık gösterebilir ve olayların görünmeyen yanını merak edebilir.',
            'Kararlılık, mahremiyet ve yeniden doğuş da Akrep\'in temaları arasında yer alır. Aynı yoğunluk bazen kıskançlık ya da kolay güvenmeme olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Akrep bir su burcudur ve sabit niteliktedir. Akrep\'in geleneksel yöneticisi Mars\'tır; modern astrolojide Plüton da bu burcun yöneticisi kabul edilir. Güneş, yaklaşık olarak 23 Ekim – 21 Kasım arasında Akrep burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Akrep Burcu',
          paragraphs: [
            'Güneş Akrep\'teyse kişinin kimliğinde derinlik ve kararlılık öne çıkabilir. Ay Akrep\'teyse duygular yoğun ama içe dönük yaşanabilir. Yükselen Akrep olan biri ise dışarıya gizemli, dikkatli ve etkileyici bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'yay',
      name: 'Yay',
      tagline: '22 Kasım – 21 Aralık · Ateş',
      title: 'Yay Burcu Özellikleri',
      description:
        'Yay burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Yay olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Yay, zodyağın dokuzuncu burcudur ve keşifle ilişkilendirilir. Özgürlük, iyimserlik ve anlam arayışı bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Yay Burcunun Genel Özellikleri',
          paragraphs: [
            'Yay; ufkunu genişletme, iyimser olma ve yeni deneyimlere açılma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, seyahat etmekten, öğrenmekten ve hayatın büyük sorularını düşünmekten keyif alabilir.',
            'Dürüstlük, mizah ve bağımsızlık da Yay\'ın temaları arasında yer alır. Aynı özgürlük isteği bazen sabırsızlık, fazla doğrudan konuşma ya da bağlanmakta zorlanma olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Yay bir ateş burcudur ve değişken niteliktedir. Yay\'ın yöneticisi Jüpiter\'dir. Güneş, yaklaşık olarak 22 Kasım – 21 Aralık arasında Yay burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Yay Burcu',
          paragraphs: [
            'Güneş Yay\'daysa kişinin kimliğinde keşif ve iyimserlik öne çıkabilir. Ay Yay\'daysa duygusal rahatlık, özgür hissetmek ve yeni şeyler yaşamak üzerinden aranabilir. Yükselen Yay olan biri ise dışarıya neşeli, açık sözlü ve maceracı bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'oglak',
      name: 'Oğlak',
      tagline: '22 Aralık – 19 Ocak · Toprak',
      title: 'Oğlak Burcu Özellikleri',
      description:
        'Oğlak burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Oğlak olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Oğlak, zodyağın onuncu burcudur ve sorumlulukla ilişkilendirilir. Disiplin, hedefler ve sabır bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Oğlak Burcunun Genel Özellikleri',
          paragraphs: [
            'Oğlak; planlı davranma, sorumluluk alma ve uzun vadeyi düşünme eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, hedeflerine adım adım ilerlemeyi ve emeklerinin zamanla karşılığını almayı önemseyebilir.',
            'Dayanıklılık, gerçekçilik ve güvenilirlik de Oğlak\'ın temaları arasında yer alır. Aynı ciddiyet bazen duygularını göstermekte zorlanma ya da kendine fazla yük alma olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Oğlak bir toprak burcudur ve öncü (kardinal) niteliktedir. Oğlak\'ın yöneticisi Satürn\'dür. Güneş, yaklaşık olarak 22 Aralık – 19 Ocak arasında Oğlak burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Oğlak Burcu',
          paragraphs: [
            'Güneş Oğlak\'taysa kişinin kimliğinde kararlılık ve hedef odaklılık öne çıkabilir. Ay Oğlak\'taysa duygular kontrollü ve ölçülü yaşanabilir. Yükselen Oğlak olan biri ise dışarıya ciddi, güvenilir ve olgun bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'kova',
      name: 'Kova',
      tagline: '20 Ocak – 18 Şubat · Hava',
      title: 'Kova Burcu Özellikleri',
      description:
        'Kova burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Kova olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Kova, zodyağın on birinci burcudur ve özgünlükle ilişkilendirilir. Yenilik, bağımsızlık ve topluluk bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Kova Burcunun Genel Özellikleri',
          paragraphs: [
            'Kova; farklı düşünme, kendi yolunu çizme ve yeniliklere açık olma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, alışılmış kalıpları sorgulamaktan ve ortak bir amaç için başkalarıyla birlikte çalışmaktan keyif alabilir.',
            'Arkadaşlık, eşitlik ve gelecek vizyonu da Kova\'nın temaları arasında yer alır. Aynı bağımsızlık bazen mesafeli görünme ya da duygularını mantıkla açıklama eğilimi olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Kova bir hava burcudur ve sabit niteliktedir. Kova\'nın geleneksel yöneticisi Satürn\'dür; modern astrolojide Uranüs de bu burcun yöneticisi kabul edilir. Güneş, yaklaşık olarak 20 Ocak – 18 Şubat arasında Kova burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Kova Burcu',
          paragraphs: [
            'Güneş Kova\'daysa kişinin kimliğinde özgünlük ve bağımsızlık öne çıkabilir. Ay Kova\'daysa duygular biraz mesafeyle, düşünülerek yaşanabilir. Yükselen Kova olan biri ise dışarıya farklı, arkadaş canlısı ve özgür ruhlu bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
    {
      slug: 'balik',
      name: 'Balık',
      tagline: '19 Şubat – 20 Mart · Su',
      title: 'Balık Burcu Özellikleri',
      description:
        'Balık burcu özellikleri, tarihleri, elementi ve yönetici gezegeni. Güneş, Ay veya yükselen Balık olduğunda haritanda neye işaret edebileceğini öğren.',
      intro:
        'Balık, zodyağın on ikinci ve son burcudur ve sezgiyle ilişkilendirilir. Hayal gücü, empati ve duyarlılık bu burcun öne çıkan temaları arasında sayılır.',
      sections: [
        {
          heading: 'Balık Burcunun Genel Özellikleri',
          paragraphs: [
            'Balık; sezgilerine güvenme, empati kurma ve hayal gücünü kullanma eğilimiyle ilişkilendirilir. Bu burcun etkisinin güçlü olduğu kişiler, başkalarının duygularını kolayca hissedebilir ve sanat, müzik ya da maneviyatla derin bir bağ kurabilir.',
            'Şefkat, esneklik ve yardımseverlik de Balık\'ın temaları arasında yer alır. Aynı duyarlılık bazen sınır koymakta zorlanma ya da gerçeklerden kaçma isteği olarak da görünebilir.',
          ],
        },
        {
          heading: 'Element, Nitelik ve Yönetici Gezegen',
          paragraphs: [
            'Balık bir su burcudur ve değişken niteliktedir. Balık\'ın geleneksel yöneticisi Jüpiter\'dir; modern astrolojide Neptün de bu burcun yöneticisi kabul edilir. Güneş, yaklaşık olarak 19 Şubat – 20 Mart arasında Balık burcundadır.',
          ],
        },
        {
          heading: 'Haritanda Balık Burcu',
          paragraphs: [
            'Güneş Balık\'taysa kişinin kimliğinde sezgi ve şefkat öne çıkabilir. Ay Balık\'taysa duygular derin ve çevreden kolay etkilenen bir şekilde yaşanabilir. Yükselen Balık olan biri ise dışarıya yumuşak, hayalperest ve anlayışlı bir ilk izlenim verebilir.',
          ],
        },
      ],
    },
  ],
};