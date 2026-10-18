import { PointTexts } from './types';

/**
 * Şans Noktası: kendini en rahat ve şanslı hissettiğin alan.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilir"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 * Bu nokta doğum saati gerektirir; saat yoksa kart hiç gösterilmez.
 */
export const PART_OF_FORTUNE_TEXTS: PointTexts = {
  signs: {
    aries:
      "Şans sana, cesaretle ilk adımı attığında gülüyor olabilir. Beklemek yerine harekete geçtiğin anlarda fırsatlar daha kolay karşına çıkar. Bir şeyi başlatmanın heyecanı sana enerji verir. Kararlı ve doğrudan davrandığında kapıların açıldığını fark edersin.",
    taurus:
      "Şansın, sabırla ve adım adım elle tutulur şeyler kurarak büyüyor olabilir. Acele etmeden emek verdiğin işler zamanla meyve verir. Güzel, rahat ve huzurlu ortamlarda kendini en şanslı hissedersin. Kendi tempona güvenmek kazançlarını kalıcı kılar.",
    gemini:
      "Şans sana, merakla yeni insanlar ve fikirlerle tanıştığında gülüyor olabilir. Bir konuşma ya da küçük bir öğrenme anı beklenmedik bir kapı açabilir. Çok yönlü olman bir dağınıklık değil, senin avantajın. Bağlantı kurmaya açık kaldıkça fırsatlar kendiliğinden çoğalır.",
    cancer:
      "Şansın, kendini duygusal olarak güvende hissettiğin ortamlarda açılıyor olabilir. Sevdiklerinle kurduğun sıcak bağlar sana destek ve fırsat getirir. Sezgilerine güvendiğin anlar genellikle doğru yöne çıkar. Kendine ve çevrene şefkatle baktıkça iyi şeyler çekersin.",
    leo:
      "Şans sana, kalbinden gelenle ve cömertçe davrandığında gülüyor olabilir. Kendini ifade ettiğin, yarattığın ve görünür olduğun yerlerde fırsatlar çoğalır. Sıcakkanlılığın ve neşen insanları yanına çeker. Kendi ışığını saklamadığında şans da seni bulur.",
    virgo:
      "Şansın, özenli çalışmanın ve ayrıntıya gösterdiğin dikkatin içinde saklı olabilir. Hazırlıklı olduğun anlarda fırsatları yakalamak sana kolay gelir. Küçük ve düzenli adımlar seni büyük sıçramalardan daha çok ileri taşır. İşe yarar bir katkı sunduğunda karşılığını görürsün.",
    libra:
      "Şans sana, uyum ve denge içinde olduğunda gülüyor olabilir. Güzellik, nezaket ve adalet duygusu seni doğru insanlara ulaştırır. Karşılıklı dinleme ve ortada buluşma becerin kapıları açar. Dengeyi koruduğunda hayat sana kolaylık sunar.",
    scorpio:
      "Şansın, derine inmeye ve dönüşmeye cesaret ettiğinde açılıyor olabilir. Sırların, yoğun duyguların ve krizlerin ardından güçlenerek çıkarsın. Sezgilerin gizli kalanı görmene yardım eder. Bir şeyi bırakıp yenilendiğinde yeni fırsatlar belirir.",
    sagittarius:
      "Şans sana, ufkunu genişlettiğinde ve cesurca denediğinde gülüyor olabilir. Yolculuklar, öğrenme ve yeni bakış açıları sana beklenmedik kapılar açar. İyimserliğin etrafındakileri de motive eder. Büyük düşündükçe şansın da büyür.",
    capricorn:
      "Şans senin için gökten düşen bir şey değil; adım adım kurduğun, sağlamlığına güvendiğin bir yapı gibi olabilir. Hızlı gelen fırsatlara biraz şüpheyle bakman seni koruyan bir sezgi olabilir. Acele etmeden, emek vererek ilerlediğinde en sağlam sonuçlara ulaşırsın. Bu yavaşlık bir eksiklik değil, senin tarzın.",
    aquarius:
      "Şansın, farklı düşünmeye ve kendi yolunu çizmeye cesaret ettiğinde açılıyor olabilir. Özgün fikirlerin ve alışılmışın dışına çıkman fırsat getirir. Topluluklarla ve ortak amaçlarla çalışmak seni besler. Sıra dışı yanını sakladığında değil, gösterdiğinde şans yaklaşır.",
    pisces:
      "Şans sana, sezgine ve akışa güvendiğinde gülüyor olabilir. Planlamanın ötesinde, içine doğan bir his seni doğru yere götürür. Şefkatin ve hayal gücün sana beklenmedik yardımlar çeker. Kontrolü biraz gevşettiğinde en güzel tesadüflerle karşılaşırsın.",
  },
  houses: {
    1: "Şansın en çok kendini ortaya koyduğun, ilk izlenim bıraktığın yerlerde açılır. Kendin gibi göründüğünde insanlar sana daha kolay güvenir. Bu doğallık fırsatları sana çeker.",
    2: "Şansın para, emek ve sahip olduklarınla ilgili alanlarda belirginleşir. Değer verdiğin şeylere emek verdikçe kazancın artabilir. Kendi kaynaklarına güvenmek sana sağlam bir rahatlık sunar.",
    3: "Şansın günlük konuşmalarda, öğrenmede ve çevrendeki insanlarla kurduğun bağlarda açılır. Bir sohbet ya da yazılı bir iletişim beklenmedik bir fırsata dönüşebilir. Merakını açık tutmak sana iyi gelir.",
    4: "Şansın ev, aile ve kök salmakla ilgili alanlarda belirginleşir. Güvenli bir yuva kurdukça diğer alanlar da kolaylaşır. İç huzurun, dış dünyadaki başarının zeminini oluşturur.",
    5: "Şansın eğlencede, yaratıcılıkta ve kalpten yaptığın şeylerde açılır. Sevdiğin bir uğraşa zaman ayırdığında beklenmedik fırsatlar çıkabilir. Oyun ve sevgi alanları sana neşe ve kazanç getirir.",
    6: "Şansın günlük düzende, işte ve sağlıklı alışkanlıklarda belirginleşir. Düzenli çalışmanın karşılığı sana uzun vadede döner. Küçük ve istikrarlı adımlar bu alanda şansını artırır.",
    7: "Şansın en çok yanında güvenilir biri olduğunda açılıyor olabilir; bu bir arkadaş, bir iş ortağı ya da hayat arkadaşın olabilir. Doğru ortaklığı acele etmeden seçmek sana büyük bir avantaj sağlar. Birlikte bir şey inşa ettiğinde yalnız başına ulaşamayacağın yerlere varırsın.",
    8: "Şansın derin bağlarda, ortak kaynaklarda ve dönüşüm süreçlerinde belirginleşir. Güvendiğin insanlarla paylaştıkça kazancın artabilir. Bırakmayı bildiğin anlar yeni fırsatlara yer açar.",
    9: "Şansın öğrenmede, yolculuklarda ve inançlarında açılır. Yeni bir yer ya da öğrenilen bir şey hayatına beklenmedik bir yön verebilir. Ufkunu geniş tuttukça şans seni bulur.",
    10: "Şansın iş, kariyer ve toplumdaki yerinle ilgili alanlarda belirginleşir. Emeğin görünür olduğunda fırsatlar sana kendiliğinden gelir. Uzun vadeli hedeflerine sadık kalmak sana başarı getirir.",
    11: "Şansın arkadaşlıklarda, topluluklarda ve ortak hayallerde açılır. Doğru insanlarla bir araya geldiğinde fırsatlar çoğalabilir. Katkı sunduğun gruplar sana da kapı açar.",
    12: "Şansın sessizlikte, iç dünyanda ve arka planda yapılan çalışmalarda belirginleşir. Durup dinlendiğinde sezgilerin sana doğru yönü gösterebilir. Gösterişsiz emeklerin zamanla karşılığını bulur.",
  },
};