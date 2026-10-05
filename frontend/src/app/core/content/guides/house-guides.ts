import { GuideCollection } from '../../models/guide';

/**
 * 12 ev rehberi: /evler ve /evler/1-ev ... /evler/12-ev sayfalarının metinleri.
 * Dil temkinlidir ("ilişkilendirilir", "işaret edebilir"): kesin hüküm verilmez.
 */
export const HOUSE_GUIDES: GuideCollection = {
  path: 'evler',
  eyebrow: 'Astroloji Rehberi',
  title: 'Doğum Haritasında 12 Ev',
  description:
    'Doğum haritasındaki 12 ev neyi anlatır? 1. evden 12. eve kadar her evin anlamını, burç ve gezegenlerle ilişkisini öğren.',
  intro:
    'Doğum haritası on iki eve bölünür ve her ev hayatın farklı bir alanıyla ilişkilendirilir: benlikten paraya, ilişkilerden kariyere. Evler, doğduğun saate ve yere göre hesaplanır; bu yüzden aynı gün doğan iki kişinin evleri birbirinden farklı olabilir.',
  ctaText: 'Kendi haritanda bu ev hangi burçta başlıyor, içinde hangi gezegenler var? Doğum bilgilerini gir, birkaç saniyede öğren.',
  items: [
    {
      slug: '1-ev',
      name: '1. Ev',
      tagline: 'Benlik · Yükselen Burç',
      title: '1. Ev Nedir? Benlik ve Yükselen Burç',
      description:
        'Astrolojide 1. ev neyi temsil eder? Benlik, ilk izlenim ve yükselen burçla ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '1. ev, doğum haritasındaki on iki evin ilkidir ve başlangıç çizgisi yükselen burçtur. Astrolojide kişinin kendini dünyaya nasıl gösterdiğiyle ilişkilendirilir.',
      sections: [
        {
          heading: '1. ev neyi temsil eder?',
          paragraphs: [
            '1. ev; benlik, kişisel kimlik, dış görünüş ve ilk izlenimle ilişkilendirilir. Kişinin yeni bir ortama girdiğinde nasıl davrandığını, hayata hangi tavırla yaklaştığını ve başkalarının onu ilk bakışta nasıl algıladığını anlatan alan olarak görülür.',
            'Bu evin başlangıç noktası yükselen burçtur. Yükselen, kişinin doğduğu anda doğu ufkunda yükselen burçtur ve diğer evlerin sıralaması da bu noktadan başlar. Bu yüzden 1. ev, haritanın en kişisel alanlarından biri sayılır.',
          ],
        },
        {
          heading: '1. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '1. evin başladığı burç, yani yükselen burç, kişinin kendini ifade etme tarzına renk verebilir. Örneğin yükselen Koç olan biri daha doğrudan ve hızlı, yükselen Terazi olan biri daha uyum arayan bir tavır sergileyebilir. 1. evdeki gezegenler de bu alanı öne çıkarır: burada Mars\'ı olan birinin girişken, Venüs\'ü olan birinin sıcak bir ilk izlenim bırakabileceği düşünülür.',
          ],
        },
        {
          heading: '1. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 1. ev, zodyağın ilk burcu olan Koç ve onun yöneticisi Mars ile ilişkilendirilir. 1. ev; 4., 7. ve 10. evlerle birlikte "köşe evleri" arasında yer alır. Köşe evlerindeki gezegenlerin haritada daha görünür olduğu kabul edilir.',
          ],
        },
      ],
    },
    {
      slug: '2-ev',
      name: '2. Ev',
      tagline: 'Para · Kaynaklar · Değerler',
      title: '2. Ev Nedir? Para, Kaynaklar ve Değerler',
      description:
        'Astrolojide 2. ev neyi temsil eder? Para, sahip olunanlar ve kişisel değerlerle ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '2. ev, doğum haritasında maddi kaynaklar ve kişinin neye değer verdiğiyle ilişkilendirilen evdir. Kazanma, harcama ve güvende hissetme biçimine dair ipuçları verdiği düşünülür.',
      sections: [
        {
          heading: '2. ev neyi temsil eder?',
          paragraphs: [
            '2. ev; para, gelir, sahip olunan eşyalar ve maddi güvenlikle ilişkilendirilir. Kişinin kaynaklarını nasıl edindiği, onları nasıl kullandığı ve kendini maddi açıdan ne zaman rahat hissettiği bu evin konuları arasında sayılır.',
            'Bu ev yalnızca parayla sınırlı görülmez. Kişinin yeteneklerini, öz değerini ve hayatta gerçekten önemsediği şeyleri de kapsar. Bu yüzden 2. ev, "neye sahibim?" sorusunun yanında "neye değer veriyorum?" sorusuyla da ilişkilendirilir.',
          ],
        },
        {
          heading: '2. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '2. evin başladığı burç, kişinin kaynaklara yaklaşımına dair bir tarz önerebilir. Örneğin 2. ev Boğa\'da başlıyorsa istikrar ve uzun vadeli güvence, Yay\'da başlıyorsa daha cömert ve risk almaya açık bir tutum öne çıkabilir. Bu evdeki gezegenler de para ve değerler konusunu haritada daha belirgin hâle getirebilir.',
          ],
        },
        {
          heading: '2. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 2. ev, Boğa burcu ve onun yöneticisi Venüs ile ilişkilendirilir. 2. ev, köşe evlerinin ardından gelen "ardıl evler" (2., 5., 8. ve 11. evler) grubundadır. Bu evler, köşe evlerinde başlayan konuların sürdürülmesi ve pekiştirilmesiyle ilişkilendirilir.',
          ],
        },
      ],
    },
    {
      slug: '3-ev',
      name: '3. Ev',
      tagline: 'İletişim · Öğrenme · Yakın Çevre',
      title: '3. Ev Nedir? İletişim, Öğrenme ve Yakın Çevre',
      description:
        'Astrolojide 3. ev neyi temsil eder? İletişim, düşünme biçimi, kardeşler ve yakın çevreyle ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '3. ev, doğum haritasında iletişim ve öğrenmeyle ilişkilendirilen evdir. Kişinin nasıl düşündüğü, konuştuğu ve günlük çevresiyle nasıl bağ kurduğu bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '3. ev neyi temsil eder?',
          paragraphs: [
            '3. ev; iletişim, yazışma, konuşma, temel eğitim ve günlük öğrenmeyle ilişkilendirilir. Kişinin bilgiyi nasıl topladığı, fikirlerini nasıl ifade ettiği ve merakının nereye yöneldiği bu evle birlikte değerlendirilir.',
            'Bu ev yakın çevreyi de kapsar: kardeşler, kuzenler, komşular ve günlük hayatta sık görülen insanlar. Kısa yolculuklar, şehir içi hareketlilik ve gündelik koşturmaca da geleneksel olarak 3. evin konuları arasında yer alır.',
          ],
        },
        {
          heading: '3. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '3. evin başladığı burç, iletişim tarzına dair ipuçları verebilir. Örneğin 3. ev İkizler\'de başlıyorsa hızlı ve meraklı, Oğlak\'ta başlıyorsa daha ölçülü ve planlı bir iletişim tarzı öne çıkabilir. Bu evde Merkür gibi bir gezegen bulunması, düşünme ve konuşma konularını haritada daha belirgin kılabilir.',
          ],
        },
        {
          heading: '3. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 3. ev, İkizler burcu ve onun yöneticisi Merkür ile ilişkilendirilir. 3. ev, "düşen evler" (3., 6., 9. ve 12. evler) grubundadır. Bu evler; öğrenme, uyum sağlama ve bir sonraki aşamaya hazırlanma temalarıyla ilişkilendirilir.',
          ],
        },
      ],
    },
    {
      slug: '4-ev',
      name: '4. Ev',
      tagline: 'Ev · Aile · Kökler',
      title: '4. Ev Nedir? Ev, Aile ve Kökler',
      description:
        'Astrolojide 4. ev neyi temsil eder? Ev, aile, kökler ve özel hayatla ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '4. ev, doğum haritasının en alt noktasında başlar ve kişinin kökleriyle ilişkilendirilir. Ev, aile ve kendini güvende hissettiği özel alan bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '4. ev neyi temsil eder?',
          paragraphs: [
            '4. ev; aile, çocukluk, yaşanılan ev ve kişinin geldiği yerle ilişkilendirilir. Dışarıdan pek görünmeyen, kişinin kapısını kapattığında kaldığı özel hayatı temsil ettiği düşünülür.',
            'Bu evin başlangıcı haritada "Gökyüzünün Dibi" (IC) olarak da bilinir. IC, haritanın en alt noktasıdır ve 10. evin başlangıcı olan Tepe Noktası\'nın (MC) tam karşısında yer alır. Bu yüzden 4. ev ile 10. ev, özel hayat ile toplumdaki rol arasındaki dengeyi birlikte anlatır.',
          ],
        },
        {
          heading: '4. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '4. evin başladığı burç, kişinin "yuva" kavramına yaklaşımını renklendirebilir. Örneğin 4. ev Yengeç\'te başlıyorsa sıcak ve koruyucu bir ev ortamı, Kova\'da başlıyorsa daha özgür ve alışılmışın dışında bir yaşam alanı öne çıkabilir. Bu evdeki gezegenler, aile ve köklerle ilgili konuları haritada daha belirgin hâle getirebilir.',
          ],
        },
        {
          heading: '4. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 4. ev, Yengeç burcu ve onun yöneticisi Ay ile ilişkilendirilir. 4. ev; 1., 7. ve 10. evlerle birlikte "köşe evleri" arasında yer alır.',
          ],
        },
      ],
    },
    {
      slug: '5-ev',
      name: '5. Ev',
      tagline: 'Aşk · Yaratıcılık · Eğlence',
      title: '5. Ev Nedir? Aşk, Yaratıcılık ve Eğlence',
      description:
        'Astrolojide 5. ev neyi temsil eder? Aşk, yaratıcılık, hobiler, eğlence ve çocuklarla ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '5. ev, doğum haritasında keyif aldığımız ve kendimizi özgürce ortaya koyduğumuz alanla ilişkilendirilir. Aşk, yaratıcılık ve oyun bu evin başlıca konuları arasında sayılır.',
      sections: [
        {
          heading: '5. ev neyi temsil eder?',
          paragraphs: [
            '5. ev; romantik ilişkiler, flört, yaratıcı işler, hobiler ve eğlenceyle ilişkilendirilir. Kişinin neyden keyif aldığı, kendini nasıl ifade ettiği ve kalbini koyduğu işler bu evle birlikte değerlendirilir.',
            'Geleneksel olarak çocuklar ve şans oyunları da 5. evin konuları arasında yer alır. Ortak tema "yaratmak ve paylaşmaktır": bir eser ortaya koymak, bir oyunu oynamak ya da birini sevmek.',
          ],
        },
        {
          heading: '5. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '5. evin başladığı burç, kişinin eğlenme ve sevme biçimine dair bir tarz önerebilir. Örneğin 5. ev Aslan\'da başlıyorsa gösterişli ve içten, Başak\'ta başlıyorsa daha seçici ve emek isteyen hobiler öne çıkabilir. Bu evdeki gezegenler, yaratıcılık ve aşk konularını haritada daha görünür kılabilir.',
          ],
        },
        {
          heading: '5. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 5. ev, Aslan burcu ve onun yöneticisi Güneş ile ilişkilendirilir. 5. ev, "ardıl evler" (2., 5., 8. ve 11. evler) grubundadır.',
          ],
        },
      ],
    },
    {
      slug: '6-ev',
      name: '6. Ev',
      tagline: 'Rutinler · Çalışma · Sorumluluklar',
      title: '6. Ev Nedir? Günlük Düzen, Çalışma ve Rutinler',
      description:
        'Astrolojide 6. ev neyi temsil eder? Günlük düzen, çalışma hayatı, alışkanlıklar ve sorumluluklarla ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '6. ev, doğum haritasında günlük hayatın akışıyla ilişkilendirilen evdir. İş yerindeki sorumluluklar, alışkanlıklar ve kişinin kendine nasıl baktığı bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '6. ev neyi temsil eder?',
          paragraphs: [
            '6. ev; günlük rutinler, çalışma ortamı, görevler ve sorumluluklarla ilişkilendirilir. 10. ev kariyerin büyük hedeflerini anlatırken 6. ev, o hedeflere giden yoldaki her günkü emeği ve iş alışkanlıklarını temsil eder.',
            'Bu ev, beden bakımı, beslenme ve uyku düzeni gibi kişinin kendine iyi bakmasını sağlayan alışkanlıklarla da ilişkilendirilir. İş arkadaşları ve evcil hayvanlar da geleneksel olarak 6. evin konuları arasında yer alır.',
          ],
        },
        {
          heading: '6. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '6. evin başladığı burç, kişinin çalışma tarzına dair ipuçları verebilir. Örneğin 6. ev Başak\'ta başlıyorsa düzenli ve ayrıntıcı, Koç\'ta başlıyorsa hızlı ve bağımsız çalışmayı seven bir tarz öne çıkabilir. Bu evdeki gezegenler, günlük düzen ve iş konularını haritada daha belirgin hâle getirebilir.',
          ],
        },
        {
          heading: '6. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 6. ev, Başak burcu ve onun yöneticisi Merkür ile ilişkilendirilir. 6. ev, "düşen evler" (3., 6., 9. ve 12. evler) grubundadır.',
          ],
        },
      ],
    },
    {
      slug: '7-ev',
      name: '7. Ev',
      tagline: 'İlişkiler · Ortaklıklar · Evlilik',
      title: '7. Ev Nedir? İlişkiler, Ortaklıklar ve Evlilik',
      description:
        'Astrolojide 7. ev neyi temsil eder? Evlilik, ortaklıklar ve birebir ilişkilerle bağını, haritanda nasıl yorumlandığını öğren.',
      intro:
        '7. ev, doğum haritasında 1. evin tam karşısında yer alır ve "ben"den "biz"e geçişi temsil eder. Evlilik, ortaklıklar ve birebir kurulan bağlar bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '7. ev neyi temsil eder?',
          paragraphs: [
            '7. ev; evlilik, uzun süreli birliktelikler, iş ortaklıkları ve anlaşmalarla ilişkilendirilir. Kişinin başkalarıyla nasıl bağ kurduğu ve bir ilişkide neye ihtiyaç duyduğu bu evle birlikte değerlendirilir.',
            'Bu evin başlangıcı "Alçalan" (Descendant) olarak bilinir ve yükselen burcun tam karşısındaki burçtur. 1. ev kişinin kendini, 7. ev ise karşısındakini ve ilişkilerde aradığı tamamlayıcı yanı anlatır. Geleneksel olarak açık rakipler de 7. evin konuları arasında yer alır.',
          ],
        },
        {
          heading: '7. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '7. evin başladığı burç, kişinin ilişkilerde aradığı niteliklere dair ipuçları verebilir. Örneğin 7. ev Terazi\'de başlıyorsa uyum ve denge, Akrep\'te başlıyorsa derinlik ve güçlü bir bağlılık öne çıkabilir. Bu evdeki gezegenler, ilişkiler konusunu haritada daha belirgin kılabilir.',
          ],
        },
        {
          heading: '7. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 7. ev, Terazi burcu ve onun yöneticisi Venüs ile ilişkilendirilir. 7. ev; 1., 4. ve 10. evlerle birlikte "köşe evleri" arasında yer alır.',
          ],
        },
      ],
    },
    {
      slug: '8-ev',
      name: '8. Ev',
      tagline: 'Paylaşım · Dönüşüm · Mahremiyet',
      title: '8. Ev Nedir? Paylaşım, Ortak Kaynaklar ve Dönüşüm',
      description:
        'Astrolojide 8. ev neyi temsil eder? Ortak kaynaklar, mahremiyet, derin bağlar ve dönüşümle ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '8. ev, doğum haritasında derin bağlar ve paylaşılan şeylerle ilişkilendirilen evdir. Ortak kaynaklar, mahremiyet ve hayattaki köklü değişimler bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '8. ev neyi temsil eder?',
          paragraphs: [
            '8. ev; ortak para, miras, borç, yatırım ve başkalarıyla paylaşılan kaynaklarla ilişkilendirilir. 2. ev kişinin kendi kaynaklarını anlatırken 8. ev, başkalarıyla birleşen kaynakları temsil eder.',
            'Bu ev yalnızca maddi konularla sınırlı görülmez. Duygusal yakınlık, güven, sırlar ve kişiyi derinden etkileyip değiştiren deneyimler de 8. evin konuları arasında yer alır. Bu yüzden bu ev çoğu zaman "dönüşüm evi" olarak anılır.',
          ],
        },
        {
          heading: '8. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '8. evin başladığı burç, kişinin paylaşım ve yakınlığa yaklaşımına dair ipuçları verebilir. Örneğin 8. ev Akrep\'te başlıyorsa yoğun ve tutkulu, İkizler\'de başlıyorsa daha meraklı ve konuşarak yakınlaşan bir tutum öne çıkabilir. Bu evdeki gezegenler, derin bağlar ve değişim konularını haritada daha görünür kılabilir.',
          ],
        },
        {
          heading: '8. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            '8. ev, Akrep burcuyla ilişkilendirilir. Akrep\'in geleneksel yöneticisi Mars\'tır; modern astrolojide Plüton da bu burcun yöneticisi kabul edilir. 8. ev, "ardıl evler" (2., 5., 8. ve 11. evler) grubundadır.',
          ],
        },
      ],
    },
    {
      slug: '9-ev',
      name: '9. Ev',
      tagline: 'Yüksek Öğrenim · Uzaklar · İnançlar',
      title: '9. Ev Nedir? Yüksek Öğrenim, Yolculuklar ve İnançlar',
      description:
        'Astrolojide 9. ev neyi temsil eder? Yüksek öğrenim, uzak yolculuklar, inançlar ve dünya görüşüyle ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '9. ev, doğum haritasında ufkun genişlemesiyle ilişkilendirilen evdir. Uzak yolculuklar, yüksek öğrenim ve kişinin hayata anlam veren inançları bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '9. ev neyi temsil eder?',
          paragraphs: [
            '9. ev; üniversite ve ileri düzey eğitim, yurt dışı, uzak yolculuklar ve farklı kültürlerle ilişkilendirilir. 3. ev günlük öğrenmeyi anlatırken 9. ev, kişinin dünyayı daha geniş bir çerçevede anlamaya çalıştığı alanı temsil eder.',
            'Bu ev; felsefe, inançlar, ahlaki değerler ve kişinin hayata bakış açısıyla da ilişkilendirilir. Yayıncılık, öğretmenlik ve bilgiyi geniş kitlelere ulaştırmak da geleneksel olarak 9. evin konuları arasında yer alır.',
          ],
        },
        {
          heading: '9. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '9. evin başladığı burç, kişinin anlam arayışına dair bir tarz önerebilir. Örneğin 9. ev Yay\'da başlıyorsa macera ve keşif, Boğa\'da başlıyorsa daha somut ve deneyime dayalı bir öğrenme isteği öne çıkabilir. Bu evdeki gezegenler, yolculuk ve öğrenme konularını haritada daha belirgin hâle getirebilir.',
          ],
        },
        {
          heading: '9. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 9. ev, Yay burcu ve onun yöneticisi Jüpiter ile ilişkilendirilir. 9. ev, "düşen evler" (3., 6., 9. ve 12. evler) grubundadır.',
          ],
        },
      ],
    },
    {
      slug: '10-ev',
      name: '10. Ev',
      tagline: 'Kariyer · Hedefler · Toplumdaki Rol',
      title: '10. Ev Nedir? Kariyer, Hedefler ve Toplumdaki Rol',
      description:
        'Astrolojide 10. ev neyi temsil eder? Kariyer, hedefler, başarı ve Tepe Noktası (MC) ile ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '10. ev, doğum haritasının en üst noktasında başlar ve kişinin dünyadaki görünür yeriyle ilişkilendirilir. Kariyer, hedefler ve toplumdaki rol bu evin başlıca konuları arasında sayılır.',
      sections: [
        {
          heading: '10. ev neyi temsil eder?',
          paragraphs: [
            '10. ev; meslek, kariyer yolu, başarı, itibar ve kişinin toplum içinde nasıl tanındığıyla ilişkilendirilir. Kişinin uzun vadede neye ulaşmak istediği ve emeğinin sonucunda nasıl bir iz bırakmak istediği bu evle birlikte değerlendirilir.',
            'Bu evin başlangıcı "Tepe Noktası" (MC, Medium Coeli) olarak bilinir ve haritanın en yüksek noktasıdır. Tam karşısında 4. evin başlangıcı olan IC yer alır. 4. ev özel hayatı, 10. ev ise kamusal hayatı anlatır.',
          ],
        },
        {
          heading: '10. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '10. evin başladığı burç, kişinin kariyerde öne çıkan tarzına dair ipuçları verebilir. Örneğin 10. ev Oğlak\'ta başlıyorsa sabırlı ve basamak basamak ilerleyen, Aslan\'da başlıyorsa görünür olmayı ve yaratıcılığını sergilemeyi seven bir tarz öne çıkabilir. Bu evdeki gezegenler, kariyer ve hedefler konusunu haritada daha görünür kılabilir.',
          ],
        },
        {
          heading: '10. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            'Geleneksel olarak 10. ev, Oğlak burcu ve onun yöneticisi Satürn ile ilişkilendirilir. 10. ev; 1., 4. ve 7. evlerle birlikte "köşe evleri" arasında yer alır.',
          ],
        },
      ],
    },
    {
      slug: '11-ev',
      name: '11. Ev',
      tagline: 'Arkadaşlar · Gruplar · Umutlar',
      title: '11. Ev Nedir? Arkadaşlar, Topluluk ve Gelecek Hedefleri',
      description:
        'Astrolojide 11. ev neyi temsil eder? Arkadaşlar, sosyal çevre, gruplar ve gelecek umutlarıyla ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '11. ev, doğum haritasında arkadaşlıklar ve topluluklarla ilişkilendirilen evdir. Kişinin içinde yer aldığı gruplar ve gelecekle ilgili umutları bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '11. ev neyi temsil eder?',
          paragraphs: [
            '11. ev; arkadaşlar, sosyal çevre, kulüpler, topluluklar ve ortak bir amaç etrafında bir araya gelinen gruplarla ilişkilendirilir. Kişinin hangi insanlarla yan yana durmayı seçtiği bu evle birlikte değerlendirilir.',
            'Bu ev aynı zamanda umutlar, dilekler ve gelecek hedefleriyle de ilişkilendirilir. 10. ev kişisel başarıyı anlatırken 11. ev, o başarının çevreye ve topluma nasıl yansıdığını ve insanların birlikte neyi değiştirmek istediğini temsil eder.',
          ],
        },
        {
          heading: '11. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '11. evin başladığı burç, kişinin arkadaşlık ve topluluklara yaklaşımına dair bir tarz önerebilir. Örneğin 11. ev Kova\'da başlıyorsa geniş ve çeşitli bir çevre, Yengeç\'te başlıyorsa daha az ama aile gibi yakın arkadaşlıklar öne çıkabilir. Bu evdeki gezegenler, sosyal çevre konusunu haritada daha belirgin hâle getirebilir.',
          ],
        },
        {
          heading: '11. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            '11. ev, Kova burcuyla ilişkilendirilir. Kova\'nın geleneksel yöneticisi Satürn\'dür; modern astrolojide Uranüs de bu burcun yöneticisi kabul edilir. 11. ev, "ardıl evler" (2., 5., 8. ve 11. evler) grubundadır.',
          ],
        },
      ],
    },
    {
      slug: '12-ev',
      name: '12. Ev',
      tagline: 'İç Dünya · Bilinçdışı · Geri Çekilme',
      title: '12. Ev Nedir? İç Dünya, Bilinçdışı ve Geri Çekilme',
      description:
        'Astrolojide 12. ev neyi temsil eder? İç dünya, bilinçdışı, yalnızlık ihtiyacı ve sezgilerle ilişkisini, haritanda nasıl yorumlandığını öğren.',
      intro:
        '12. ev, doğum haritasının son evidir ve yükselen burçtan hemen önce gelir. Kişinin iç dünyası, görünmeyen yanları ve dinlenip toparlandığı alan bu evin konuları arasında sayılır.',
      sections: [
        {
          heading: '12. ev neyi temsil eder?',
          paragraphs: [
            '12. ev; iç dünya, bilinçdışı, rüyalar, sezgiler ve yalnız kalma ihtiyacıyla ilişkilendirilir. Kişinin başkalarına kolayca göstermediği duyguları ve kendini dinlemek için geri çekildiği zamanlar bu evle birlikte değerlendirilir.',
            'Bu ev; maneviyat, şefkat, gönüllülük ve başkalarına karşılıksız yardım etmekle de ilişkilendirilir. Hastaneler, inzivalar ve uzak, sessiz yerler de geleneksel olarak 12. evin konuları arasında yer alır. Bir döngünün sonu olduğu için bu ev, kapanışlar ve yeni bir başlangıca hazırlıkla da ilişkilendirilir.',
          ],
        },
        {
          heading: '12. Evdeki Burç ve Gezegenler',
          paragraphs: [
            '12. evin başladığı burç, kişinin iç dünyasına dair ipuçları verebilir. Örneğin 12. ev Balık\'ta başlıyorsa hayal gücü ve empati, Başak\'ta başlıyorsa iç düzeni sağlama ve kafasındaki düşünceleri toparlama isteği öne çıkabilir. Bu evdeki gezegenler, çoğu zaman kişinin içinde yaşadığı ama dışa pek yansıtmadığı yanlarla ilişkilendirilir.',
          ],
        },
        {
          heading: '12. ev hangi burç ve gezegenle ilişkilendirilir?',
          paragraphs: [
            '12. ev, Balık burcuyla ilişkilendirilir. Balık\'ın geleneksel yöneticisi Jüpiter\'dir; modern astrolojide Neptün de bu burcun yöneticisi kabul edilir. 12. ev, "düşen evler" (3., 6., 9. ve 12. evler) grubundadır.',
          ],
        },
      ],
    },
  ],
};