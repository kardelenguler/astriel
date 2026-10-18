import { PointTexts } from './types';

/**
 * Kuzey Düğüm: büyümeye çağrıldığın yön.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilirsin"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 */
export const NORTH_NODE_TEXTS: PointTexts = {
  signs: {
    aries:
      "İçinde bir yerde “ben de yapabilirim” diyen bir ses var, ama çoğu zaman sırasını bekliyor. Başkaları karar verirken beklemeyi, kendi isteğini geri plana atmayı öğrenmiş olabilirsin. Bu sabır bir yerde seni korumuştur; ama artık o sesin biraz daha yüksek çıkmasına izin verebilirsin. Küçük de olsa kendi adımını attığında ne kadar canlı hissettiğini fark edersin.",
    taurus:
      "Hayatın seni sürekli bir şeylerin içine çektiği, bir kriz bitince yenisinin başladığı dönemler yaşamış olabilirsin. Yoğun duygular ve ani değişimler sana tanıdık gelir; ama seni asıl iyi hissettiren yavaşlayıp elinin altındaki basit şeylerin tadına varmaktır. Bir sofranın, bir yürüyüşün ya da düzenli bir rutinin içinde toprağa bastığını hissedersin. Sabırla kurduğun küçük bir güvenlik duygusu seni büyük dalgalardan daha çok taşıyabilir.",
    gemini:
      "Her şeyin büyük bir anlamı olmak zorunda olduğunu düşünüp kendini ağır sorular altında bulmuş olabilirsin. Kesin cevaplar aramak yerine bazen sadece merak etmek, sormak ve karşındakini dinlemek yeter. Hafif bir sohbetin ya da küçük bir öğrenme anının sana ne kadar iyi geldiğine şaşırabilirsin. Her şeyi bilmek zorunda olmadığını kabul ettikçe öğrenmenin keyfi geri gelir.",
    cancer:
      "Güçlü ve başarılı görünmek, bir yerde sana zırh gibi gelmiş olabilir. Hep sağlam durmak, sorumluluğu üstlenmek ve duygularını ikinci plana atmak sana tanıdık gelir. Oysa en çok iyi hissettiren an, birinin yanında zırhını çıkarıp saklamadığın andır. Kendine ve sevdiklerine şefkatle baktıkça içindeki sert sesin yumuşadığını görebilirsin.",
    leo:
      "Dikkat çekmemeyi, kalabalığın içinde uyumlu ve sessiz kalmayı belki erken öğrenmişsindir. Gruba karışmak sana güvenli gelir. Oysa içinde sahneye çıkmak, yaratmak ve gülmek isteyen bir taraf var. Kalbinden gelen bir şeyi cesaretle paylaştığında nasıl ışıldadığını görmek seni şaşırtabilir.",
    virgo:
      "Hayallerin ve belirsizliklerin arasında kaybolmak, sana tanıdık bir kaçış yolu gibi gelmiş olabilir. Her şeyi akışına bırakmak seni bazen yönsüz hissettirir. Seni asıl dengeleyen, küçük ve somut bir işi düzenli biçimde yapmaktır. Bir listeyi bitirdiğinde ya da bir şeyi düzene koyduğunda ne kadar sakinleştiğine dikkat edebilirsin.",
    libra:
      "Kendi başına karar vermeyi ve kimseye ihtiyaç duymamayı güç sanmış olabilirsin. Önce kendi isteğini öne koymak sana tanıdık ve güvenli gelir. Oysa seni büyüten, birine kulak vermek ve ortada buluşmaktır. Bir ilişkide karşılıklı denge kurabildiğinde, yalnız başına ulaşamayacağın bir huzura yaklaşabilirsin.",
    scorpio:
      "Güvende kalmak için elindekilere sıkıca tutunmuş, konforunu bozmamaya çalışmış olabilirsin. Değişim ve yoğun duygular sana tehdit gibi gelir. Oysa seni asıl dönüştüren, derin bir bağa cesaret etmek ve bazı şeyleri bırakabilmektir. Kırılgan olduğun bir anda içten konuştuğunda ilişkinin nasıl derinleştiğine tanık olabilirsin.",
    sagittarius:
      "Ayrıntıların ve bilgi yığınının içinde boğulup büyük resmi gözden kaçırmış olabilirsin. Her şeyi toplamak, ölçmek ve doğrulamak sana güven verir. Seni asıl açan, merakla uzağa bakmak ve neye inandığını sormaktır. Yeni bir yere ya da fikre doğru bir adım attığında ufkunun ne kadar genişlediğini fark edebilirsin.",
    capricorn:
      "Başkalarına bakım vermeyi ve onlara duygusal güvenlik sunmayı çok iyi biliyor olabilirsin. Kendi ihtiyaçlarını başkalarının duygularının arkasına koymak sana tanıdık gelir. Oysa kendi hedeflerini koymak ve onların sorumluluğunu almak da seni büyütür. Sabırla kurduğun bir şeyin ayakta durduğunu gördüğünde kendi gücüne ne kadar güvenebildiğini görebilirsin.",
    aquarius:
      "Dikkat çekmek, beğenilmek ve sahnenin ortasında olmak sana tanıdık bir yol gibi gelmiş olabilir. Onay görmek seni bazen gerçek ihtiyacından uzaklaştırır. Oysa seni asıl besleyen, bir topluluğun parçası olup kendine özgü fikrini paylaşmaktır. Ortak bir amaç için çalıştığında bireyselliğinden ödün vermeden de ait olabildiğini keşfedebilirsin.",
    pisces:
      "Her şeyi çözmek, hata bırakmamak ve kontrolde kalmak için çok çabalamış olabilirsin. Ayrıntıları düzeltmek sana güven verir, ama seni de yorar. Oysa seni asıl dinlendiren, sezgine güvenmek ve akışa biraz izin vermektir. Kendine ve başkalarına şefkatle yaklaştığında içindeki gerginliğin çözüldüğünü hissedebilirsin.",
  },
  houses: {
    1: "Bu yol en çok kendini ortaya koyduğun yerlerde açılır. Kim olduğunu saklamadan, kendi tarzınla göründüğünde yönün netleşebilir. Başkalarının ne düşüneceğinden önce kendi içinden gelene kulak vermek sana güçlü bir başlangıç sağlar.",
    2: "Bu yönelim, kendi değerlerini ve elindeki kaynakları sahiplendiğin yerde güçlenir. Neye ne kadar emek verdiğini bilmek sana sağlam bir özgüven kazandırabilir. Kendi ayakların üzerinde duran bir düzen kurdukça yolun da berraklaşır.",
    3: "Bu çağrı günlük konuşmalarda, öğrendiklerinde ve çevrendekilerle kurduğun küçük bağlarda duyulur. Bir soruyu sormaktan ya da fikrini paylaşmaktan çekinmediğinde kapılar açılabilir. Yazmak, anlatmak ya da basitçe merak etmek bu yolda sana eşlik eder.",
    4: "Bu yol, ev ve aile hissinin ya da iç dünyanın içinde şekillenir. Kendine güvenli bir köşe yarattıkça dışarıdaki adımların da sağlamlaşabilir. Köklerine ve duygularına zaman ayırmak seni beklediğinden daha ileri taşır.",
    5: "Bu yön en çok yaratıcılığın, oyunun ve kalpten yaptığın şeylerin içinde belirginleşir. Sırf hoşuna gittiği için bir şeyle uğraşmak seni doğru yöne taşıyabilir. Sevdiğin şeyi sonuç kaygısı olmadan yapabildiğin anlar yolunu gösteren işaretlerdir.",
    6: "Bu yolculuk günlük düzenin, işin ve küçük alışkanlıkların içinde ilerler. Her gün tekrarladığın ufak bir adım zamanla seni sandığından uzağa götürebilir. Bedenine ve zamanına iyi bakan bir rutin bu yönelimi sessizce destekler.",
    7: "Bu çağrı birebir ilişkilerde, ortaklıklarda ve karşındakiyle kurduğun dengede duyulur. Biriyle gerçekten karşılıklı olabildiğinde yönünü daha net görebilirsin. Sana ayna tutan insanlar kendini tanımanda yardımcı olur.",
    8: "Bu yol derin bağlarda, paylaşılan kaynaklarda ve içsel dönüşümlerde şekillenir. Güvendiğin birine açıldıkça bırakmaya hazır olduğun şeyler kendiliğinden belirginleşebilir. Yoğun anlar korkutucu gelse de seni asıl yenileyen yerler onlardır.",
    9: "Bu yön öğrenmenin, inançların ve uzak yolların içinde büyür. Yeni bir yer, kitap ya da düşünce seni beklediğinden daha ileri taşıyabilir. Kendi doğruna ulaşmak için konfor alanının dışına çıkmak bu yolu açar.",
    10: "Bu çağrı iş, hedefler ve dünyada bıraktığın iz alanında belirginleşir. Uzun vadeli bir yön seçip sorumluluğu üstlendiğinde ne kadar sahici hissettiğini görebilirsin. Görünür olmak zor gelse bile emeğinin karşılık bulması bu yolda sana güç verir.",
    11: "Bu ses en çok arkadaşlıklar ve topluluklar içinde duyulmak ister. Ona alan açtıkça aynı dili konuşan insanlar karşına çıkmaya başlar. Bir grubun içinde ilk sözü almak ya da bir fikri başlatmak, sandığından çok daha doğal gelebilir.",
    12: "Bu yol sessizlikte, yalnız kaldığın anlarda ve iç dünyanda derinleşir. Durup dinlendiğinde gürültüde duyamadığın bir yön hissedebilirsin. Hayal kurmak, sessizce oturmak ya da meditasyon gibi sakinleştirici alanlar bu çağrıya yer açar.",
  },
};