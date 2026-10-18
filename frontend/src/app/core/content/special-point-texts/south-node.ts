import { PointTexts } from './types';

/**
 * Güney Düğüm: sana en tanıdık gelen alışkanlıklar.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilirsin"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 */
export const SOUTH_NODE_TEXTS: PointTexts = {
  signs: {
    aries:
      "Her işe ilk atılan, hemen karar veren ve kendi bildiğini yapan taraf sana çok tanıdık gelebilir. Kendi başına hareket etmek sana güven verir. Ama sürekli öne atılmak, yorulduğunda bile yardım istememeye dönüşebilir. Biraz yavaşlayıp başkalarının da katkısına yer açmak seni rahatlatır.",
    taurus:
      "Konforlu, bildik ve güvenli olana tutunmak sana çok tanıdık gelir. Elindekini kaybetme korkusu, değişimi ertelemene neden olmuş olabilir. Rahat alanın seni korur; ama fazla kaldıkça biraz durağanlaşabilirsin. Küçük bir değişikliğe izin vermek, sandığından daha az şey kaybettirir.",
    gemini:
      "Her konuda biraz bilgi toplamak, hızlıca fikir değiştirmek ve her şeyi konuşarak çözmeye çalışmak sana tanıdık gelir. Merakın gerçekten bir güç; ama bazen derine inmek yerine yüzeyde dolaşıyor olabilirsin. Zihnin sürekli meşgulken hissettiklerini dinlemeye zaman bulamayabilirsin. Bir konuyu sonuna kadar götürmek sana gerçek bir doyum verir.",
    cancer:
      "Başkalarının duygularını üstlenmek, herkesi gözetmek ve geçmişe tutunmak sana çok tanıdık gelir. Bu şefkat güzel bir yetenek; ama kendi ihtiyaçlarının hep ikinci sırada kaldığını fark ediyor olabilirsin. Bazen kırılganlığının arkasına saklanmak yeni adımlar atmanı zorlaştırabilir. Önce kendi duygusal sınırlarını çizmek, ilişkilerini daha sağlıklı yapar.",
    leo:
      "Ortamın merkezinde olmak, takdir görmek ve ilgi toplamak sana tanıdık gelir. Beğenilmek sana güç verir; ama onay gelmediğinde kendini gölgede hissedebilirsin. Hep sahnede olma isteği bazen gerçek yakınlığı gölgeleyebilir. Alkış olmadan da değerli olduğunu hatırlamak seni özgürleştirir.",
    virgo:
      "Her şeyi düzeltmek, mükemmelleştirmek ve ayrıntılarda kaybolmak sana çok tanıdık gelir. Bu titizlik sana güven verir; ama eleştirel sesin zaman zaman kendine de yöneliyor olabilir. Her şeyi kontrol altında tutmaya çalışmak seni yorar. Yeterince iyi olanı kabul etmek içindeki gerginliği azaltır.",
    libra:
      "Bir odaya girdiğinde önce herkesin iyi olup olmadığına bakan biri olabilirsin. Gerginliği hissettiğin an onu yumuşatmanın bir yolunu bulmak sende neredeyse içgüdüsel. Bu incelik gerçekten değerli; ama bazen kendi isteğini söylemek yerine herkesin hoşuna gideni seçiyor olabilirsin. Uyumu korumak için sessizce vazgeçtiğin şeylerin birikmesine izin vermemek sana iyi gelir.",
    scorpio:
      "Yoğun duygulara, sırlara ve kontrol etme isteğine kolayca kapılmak sana tanıdık gelir. Bağlandığın kişiyi ya da durumu sıkı sıkı tutmak güven verir; ama bırakamadığın şeyler seni yorabilir. Derin ilişkilerde bile güveni test etmeye devam ediyor olabilirsin. Bazı şeylerin kendi akışına bırakılabileceğini görmek seni hafifletir.",
    sagittarius:
      "Büyük anlamlar aramak, her şeyin bir felsefesi olduğuna inanmak ve hep bir sonraki maceraya koşmak sana tanıdık gelir. Bu özgürlük isteği seni canlı tutar; ama bir yere kök salmaktan kaçıyor olabilirsin. Haklı olma isteği bazen dinlemeni zorlaştırabilir. Bulunduğun yerde durup ayrıntıya bakmak sana yeni bir derinlik katar.",
    capricorn:
      "Sorumluluğu üstlenmek, güçlü görünmek ve her şeyi kendi omuzlarında taşımak sana çok tanıdık gelir. Bu dayanıklılık seni ayakta tutar; ama yardım istemeyi zayıflık sayıyor olabilirsin. Sürekli hedefe odaklanmak anın tadını kaçırmana neden olabilir. Yükünü paylaştığında kendini ne kadar hafif hissettiğini fark edersin.",
    aquarius:
      "Mesafeli durmak, kendi fikrine sadık kalmak ve topluluğun biraz dışından bakmak sana tanıdık gelir. Bağımsızlık sana güven verir; ama yakınlaştıkça geri çekiliyor olabilirsin. Duygularını fikirlerinin arkasına saklamak bazen seni yalnız bırakabilir. Kalbinden konuşmak bağlarını sandığından daha fazla güçlendirir.",
    pisces:
      "Akışa bırakmak, hayal kurmak ve başkalarının acısını kendininmiş gibi hissetmek sana çok tanıdık gelir. Bu şefkat güzel; ama sınırların bulanıklaşınca kendini kaybedebilirsin. Zor anlarda gerçeklikten kaçıp hayale sığınma isteği olabilir. Somut ve küçük bir adım atmak ayaklarını yere bastırır.",
  },
  houses: {
    1: "Bu alışkanlık en çok kendini ifade ederken ve ilk izlenim bıraktığında belirginleşir. Hep aynı tarzda görünmek sana güvenli gelebilir. Kendini biraz farklı göstermeyi denemek yeni bir yön açar.",
    2: "Bu alışkanlık para, emek ve sahip olduklarınla ilişkinde kendini gösterir. Bildik bir güvenlik düzenine tutunmak rahat ettirir ama seni sınırlayabilir. Değerini sahip olduklarından bağımsız görmek yolunu genişletir.",
    3: "Bu alışkanlık günlük konuşmalarda ve çevrendekilerle kurduğun bağlarda ortaya çıkar. Hep aynı şekilde iletişim kurmak seni bir kalıba sokabilir. Farklı bir tonla konuşmayı denemek yeni kapılar açar.",
    4: "Bu alışkanlık ev, aile ve geçmişle ilişkinde belirginleşir. Çocukluktan gelen rolleri sürdürmek tanıdık ve rahat gelir. Kendi yuvanı kendi kurallarınla kurmak seni özgürleştirebilir.",
    5: "Bu alışkanlık en çok eğlenirken, yaratırken ve kalbinden bir şey yaparken ortaya çıkıyor olabilir. Hep “doğru olanı” yapmaya çalışıyorsan, biraz dağınık kalmaya izin vermek seni rahatlatır. Kusursuz değil, sana ait olan şeyler seni en çok mutlu edecek olanlardır.",
    6: "Bu alışkanlık işte, günlük düzende ve başkalarına hizmet ederken kendini gösterir. Hep çalışmak ya da hep yardım etmek sana tanıdık ve güvenli gelebilir. Dinlenmeye ve kendine zaman ayırmaya izin vermek dengeni kurar.",
    7: "Bu alışkanlık birebir ilişkilerde ve ortaklıklarda kendini gösterir. Aynı rolü tekrar tekrar üstlenmek benzer insanları çekebilir. İlişkide yeni bir rol denemek dengeyi değiştirir.",
    8: "Bu alışkanlık derin bağlarda, paylaşılan kaynaklarda ve güven konularında belirginleşir. Kontrolü elde tutmak ya da bağları sıkı tutmak güven verir ama seni yorabilir. Bırakmak bazen en büyük güç olur.",
    9: "Bu alışkanlık inançlarında, öğrenme biçiminde ve yolculuklarında ortaya çıkar. Bildiğin bir bakış açısına sıkı sıkı sarılmak rahatlatır ama ufkunu daraltabilir. Merakla yeni bir görüşü dinlemek seni genişletir.",
    10: "Bu alışkanlık iş hayatında ve toplum karşısındaki rolünde belirginleşir. Bildik bir kariyer rolüne sıkışmak güvenli gelir ama seni durdurabilir. Kendi başarı tanımını yeniden yazmak yolunu açar.",
    11: "Bu alışkanlık arkadaşlıklarında ve katıldığın topluluklarda kendini gösterir. Hep aynı gruba ait olmak rahat ettirir ama seni sınırlayabilir. Yeni insanlarla tanışmak ufkunu açar.",
    12: "Bu alışkanlık yalnız kaldığında ve iç dünyanda belirginleşir. Kendi içine çekilmek bir sığınak olur ama seni dünyadan koparabilir. Yalnızlığı bir kaçış değil, bilinçli bir dinlenme olarak seçmek dengeni korur.",
  },
};