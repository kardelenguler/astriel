import { PointTexts } from './types';

/**
 * Juno: bağlılık ilişkisinde aradığın şey ve bir ilişkiyi ciddiye alma biçimin.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilirsin"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 */
export const JUNO_TEXTS: PointTexts = {
  signs: {
    aries:
      "Bir ilişkide cesur, doğrudan ve kendi gücünü bastırmayan bir partner arıyor olabilirsin. Sıkıcı ve fazla temkinli bir bağ seni çabuk yorar. Tutkuyu canlı tutan, meydan okumaktan korkmayan biriyle yan yana büyürsün. İlişkide kendi alanını açıkça söylemek, ikinizin de nefes almasını sağlar.",
    taurus:
      "Güvenli, sakin ve sözüne sadık bir bağ kurmak senin için çok önemli olabilir. Sevgiyi söylenenden çok zamanla ve küçük sadakat işaretleriyle ölçüyor olabilirsin. Birlikte kurulan sağlam bir düzen sana huzur verir. Değişimi tamamen reddetmek yerine ilişkiye biraz esneklik tanımak bağı daha da güçlendirir.",
    gemini:
      "Seninle konuşabilen, merakını paylaşan ve hep yeni bir şey bulabilen bir partner sana iyi gelebilir. Sessizlik ve iletişimsizlik seni ilişkide en çok yoran şey olabilir. Birlikte gülmek ve fikir alışverişi yapmak bağı canlı tutar. Hafif konuşmaların yanında duygularını da açıkça söylersen ilişki derinleşir.",
    cancer:
      "Seni koruyan, duygularını önemseyen ve bir yuva hissi veren biriyle olmak istiyor olabilirsin. Bağ kurduğunda tüm kalbinle ilgilenir, aynı şefkati karşılığında beklersin. Sevgi ve güven senin için aynı kelimenin iki yüzüdür. Beklentilerini içine atmak yerine nazikçe dile getirmek ilişkini rahatlatır.",
    leo:
      "Seni gerçekten görüp takdir eden, sevgisini cömertçe gösteren bir partner arıyor olabilirsin. Bir ilişkide özel hissetmek senin için vazgeçilmezdir. Sıcak, sadık ve gurur duyabileceğin biriyle en iyi hâlini ortaya koyarsın. Sevilmek kadar sevgini de açıkça göstermek bağı büyütür.",
    virgo:
      "Güvenilir, özenli ve gündelik hayatta gerçekten yanında olan biriyle huzur bulabilirsin. Sevgiyi büyük sözlerden çok küçük ilgilerde görüyor olabilirsin. Birlikte emek vermek ve birbirini geliştirmek ilişkiyi besler. Partnerinde kusur aramak yerine çabasını fark etmek bağı yumuşatır.",
    libra:
      "Eşit, dengeli ve karşılıklı saygıya dayanan bir ilişki senin için çok değerli olabilir. Uyum bozulduğunda içten içe huzursuz olabilirsin. Birlikte karar verdiğiniz, birbirinizin yanında güzelleştiğiniz bir bağ arıyorsun. Çatışmadan kaçmak yerine açıkça konuşmak dengeyi gerçekten korur.",
    scorpio:
      "Derin, sadık ve yarım bırakılmayan bir bağ kurmak istiyor olabilirsin. Yüzeysel bir yakınlık seni tatmin etmez. Güven kurulduğunda tüm kalbinle bağlanır, aynısını karşılığında beklersin. Kontrol etme isteğini fark edip güveni zamana bırakmak ilişkiyi iyileştirir.",
    sagittarius:
      "Özgürlüğüne saygı duyan, seninle birlikte keşfeden ve hayata umutla bakan bir partner arıyor olabilirsin. Kısıtlandığını hissettiğin bir ilişki seni uzaklaştırır. Ortak bir inanç ya da maceranın bağı güçlendirdiğini görebilirsin. Bağlılığı özgürlüğün karşıtı olarak görmemek ilişkini rahatlatır.",
    capricorn:
      "Ciddi, sorumlu ve geleceği birlikte kurabileceğin biriyle bağ kurmak istiyor olabilirsin. Bir ilişkiye girdiğinde gerçekten emek verirsin. Zamanla sağlamlaşan, sözünün arkasında duran bir bağ sana en çok güven verir. Duygularını da göstermek ilişkiyi sadece sağlam değil, sıcak da yapar.",
    aquarius:
      "Seni değiştirmeye çalışmadan sevebilen, farklılığına alan açan bir partner istiyor olabilirsin. Ortak bir merak ya da ideal, bağını senin için çok daha anlamlı kılar. Bir ilişkide hem yakın hem özgür kalabilmek senin için önemlidir. Duygularını açmak bazen zor gelse de küçük adımlarla yakınlığı büyütebilirsin.",
    pisces:
      "Ruhunu anlayan, şefkatli ve sezgisel bir bağ arıyor olabilirsin. Kelimelere dökmeden bile anlaşılmak sana çok değerli gelir. Romantik ve derin bir bağ, senin için bir ilişkinin kalbidir. Kendi sınırlarını korumak, sevgide kaybolmadan yakın kalmanı sağlar.",
  },
  houses: {
    1: "Bu bağlılık arayışı en çok kendin olduğun, doğrudan görünen yanlarında hissediliyor olabilir. İlişkilerde kimliğini kaybetmeden var olmak senin için önemlidir. Partnerinle birlikte büyürken kendi sesini korumak bağı sağlıklı tutar.",
    2: "Bu bağlılık arayışı güven, ortak kaynaklar ve gündelik güvence konularında kendini gösteriyor olabilir. Sevgiyi somut bir destek ve istikrarla da hissetmek istersin. Maddi ve duygusal güvenliği açıkça konuşmak ilişkine rahatlık getirir.",
    3: "Bu bağlılık arayışı iletişimde, günlük sohbette ve birlikte öğrenmede kendini gösteriyor olabilir. Bir ilişkide anlaşılmak ve konuşabilmek senin için temel ihtiyaçtır. Küçük, sık paylaşımlar bağı sürekli taze tutar.",
    4: "Bu bağlılık arayışı ev, aile ve birlikte kurulan bir yuva etrafında şekilleniyor olabilir. Gerçek yakınlık senin için güvenli bir ortamda mümkündür. Birlikte bir ev hissi yaratmak ilişkinin temelini sağlamlaştırır.",
    5: "Bu bağlılık arayışı aşkta, oyunda ve ortak yaratıcılıkta kendini gösteriyor olabilir. İlişkinin neşeli ve canlı kalması senin için önemlidir. Birlikte eğlenmeyi ve romantizmi ihmal etmemek bağı besler.",
    6: "Bu bağlılık arayışı gündelik düzende, birlikte çalışmada ve karşılıklı destekte kendini gösteriyor olabilir. Sevgiyi büyük jestlerden çok küçük ve düzenli ilgilerde görürsün. Birbirinizin yükünü paylaşmak ilişkiyi güçlendirir.",
    7: "Bu bağlılık arayışı birebir ilişkilerde ve evlilik gibi açık taahhütlerde belirgin olabilir. Bir ortaklık kurmak senin için hayatın merkezi bir konusu olabilir. Beklentilerini açıkça paylaşmak bu bağı sağlam bir zemine oturtur.",
    8: "Bu bağlılık arayışı derin güven, duygusal yakınlık ve ortak bir dönüşümle kendini gösteriyor olabilir. Yüzeysel bir bağ seni tatmin etmeyebilir. Savunmasızlığı paylaşabildiğin kadar gerçek bir yakınlık kurarsın.",
    9: "Seni değiştirmeye çalışmadan sevebilen birini istiyor olabilirsin. Bu bağlılık arayışı ortak inançlar, keşifler ve öğrenme alanında şekilleniyor olabilir. Ortak bir merak, ikinizi beklediğinizden daha derin bir yere taşıyabilir.",
    10: "Bu bağlılık arayışı hedefler, sorumluluk ve toplum önündeki duruşunla bağlantılı olabilir. Seni hedeflerinde destekleyen ve sana saygı duyan bir partner önemlidir. Ortak bir yön belirlemek ilişkine güç katar.",
    11: "Bu bağlılık arayışı arkadaşlık, ortak ideal ve bir topluluğun parçası olmakla bağlantılı olabilir. En iyi ilişkiler senin için aynı zamanda iyi bir dostluktur. Ortak değerler ve geniş bir çevre bağı zenginleştirir.",
    12: "Bu bağlılık arayışı sessiz, ruhsal ve sözün ötesinde bir yakınlıkla kendini gösteriyor olabilir. Bazen ilişkini kimseye anlatamadığın bir iç dünya gibi yaşayabilirsin. Birlikte sessiz kalabilmek ve yalnız zaman tanımak bağı derinleştirir.",
  },
};