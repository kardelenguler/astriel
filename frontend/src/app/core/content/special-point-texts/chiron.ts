import { PointTexts } from './types';

/**
 * Kiron (Chiron): seni en çok zorlayan konu ve ondan doğan iyileştirme gücü.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilirsin"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 * Konu hassas olduğu için dil yargılamaz, tanı koymaz; yalnızca duyarlı bir alanı anlatır.
 */
export const CHIRON_TEXTS: PointTexts = {
  signs: {
    aries:
      "Kendi başına var olmak, istediğini söylemek ve ilk adımı atmak sana bir yerde acı vermiş olabilir. Kendine güvenmediğin anlarda yetersiz hissediyor olabilirsin. Bu hassas nokta zamanla başkalarının cesaretine destek olma gücüne dönüşür. Kendine “yapabilirsin” dediğin her an iyileşme yolunda küçük bir adımdır.",
    taurus:
      "Yeterince değer görmediğini, güvende olmadığını ya da hak etmediğini hissettiğin anlar yaşamış olabilirsin. Maddi ve duygusal güvenlik sana hassas bir konu olabilir. Bu deneyim, değerin ve huzurun ne demek olduğunu derinden öğretir. Kendine sabırla ve yumuşakça yaklaşmak seni iyileştirir.",
    gemini:
      "Sesini duyuramadığın, yanlış anlaşıldığın ya da söylediklerinin küçümsendiği anlar yaşamış olabilirsin. İfade etmek konusunda hassas bir yanın olabilir. Bu deneyim, başkalarını gerçekten dinleyen biri olmanı sağlar. Kendi sözlerine değer verdikçe iyileşme başlar.",
    cancer:
      "Yeterince korunmadığını, sevilmediğini ya da ait olamadığını hissettiğin anlar yaşamış olabilirsin. Duygusal güvenlik sana hassas bir konu olabilir. Bu deneyim, başkalarına gerçek bir şefkatle yaklaşma gücü verir. Kendine bir yuva olmayı öğrendikçe içindeki boşluk dolar.",
    leo:
      "Görülmediğini, takdir edilmediğini ya da parlamana izin verilmediğini hissetmiş olabilirsin. Kendini ifade etmek konusunda hassas bir yanın olabilir. Bu deneyim, başkalarının ışığını görmeni ve desteklemeni sağlar. Kendi değerini kimsenin onayına bağlamadığında iyileşirsin.",
    virgo:
      "Yeterince iyi olmadığını, hep bir şeylerin eksik kaldığını düşündüğün zamanlar yaşamış olabilirsin. Kendine karşı sert ve eleştirel bir sesin olabilir. Bu deneyim, başkalarının kusurlarına şefkatle bakmanı sağlar. Mükemmel olmak yerine kendine “yeterince iyisin” demek seni iyileştirir.",
    libra:
      "İlişkilerde yeterince görülmediğin, dengenin hep senin aleyhine kurulduğu anlar yaşamış olabilirsin. Adalet ve karşılıklılık konusunda hassas bir yanın olabilir. Bu deneyim, başkalarının ilişki yaralarını anlamanı sağlar. Kendi ihtiyaçlarını da ilişkinin parçası saydıkça iyileşirsin.",
    scorpio:
      "Güvenin sarsıldığı, ihanete uğradığın ya da çok yoğun hissettiğin için incindiğin anlar yaşamış olabilirsin. Yakınlık ve kontrol konularında hassas olabilirsin. Bu deneyim, derin acıları anlayabilen biri olmanı sağlar. Güvenmeyi yeniden öğrendikçe iyileşirsin.",
    sagittarius:
      "İnancını, umudunu ya da özgürce keşfetme hakkını kaybettiğini hissettiğin anlar yaşamış olabilirsin. Hayatın bir anlamı olup olmadığı konusunda hassas bir yanın olabilir. Bu deneyim, başkalarına yol gösteren bir bilgelik kazandırır. Küçük bir merak bile yeniden umut doğurabilir.",
    capricorn:
      "Başardıkça rahatlayacağını sandığın ama çıtanın hep biraz daha yükseldiği anlar yaşamış olabilirsin. Her şeyin kontrolünde olması gerektiğini hissetmek seni bir yerde yormuş olabilir. Bu döngüyü fark etmek bile iyileşmenin başlangıcıdır. Kendine, başkalarına gösterdiğin kadar anlayışlı davranmak bu yolda sana destek olur.",
    aquarius:
      "Hiçbir gruba ait olamadığını ya da herkesten farklı olduğun için dışarıda kaldığını hissetmiş olabilirsin. Kabul görme konusunda hassas bir yanın olabilir. Bu deneyim, dışarıda kalanları fark eden bir insan olmanı sağlar. Farklılığını bir eksik değil, kendi özelliğin olarak görmek seni iyileştirir.",
    pisces:
      "Acıyı tek başına taşımak zorunda kaldığın ya da sınırlarını koruyamadığın anlar yaşamış olabilirsin. Başkalarının acısını fazla üstleniyor olabilirsin. Bu deneyim, derin bir şefkat ve sezgi kazandırır. Kendi sınırlarını çizdikçe ve dinlendikçe iyileşirsin.",
  },
  houses: {
    1: "Bu hassas nokta en çok kendini gösterdiğin, kim olduğunu ortaya koyduğun anlarda hissediliyor olabilir. Kendini olduğu gibi kabul etmek zaman alabilir. Kendine nazik davrandıkça başkalarına da yol gösterirsin.",
    2: "Bu hassas nokta para, değer ve kendi kaynaklarınla ilişkinde hissediliyor olabilir. Yeterince sahip olmadığını ya da hak etmediğini düşündüğün anlar olabilir. Kendi değerini sahip olduklarından bağımsız görmek seni rahatlatır.",
    3: "Bu hassas nokta iletişimde, öğrenmede ve çevrendekilerle kurduğun bağlarda hissediliyor olabilir. Kendini ifade etmek ya da anlaşılmak bazen zor gelebilir. Kendi sözlerine değer verdikçe bu alan şifa bulur.",
    4: "Bu hassas nokta ev, aile ve geçmişinle ilişkinde hissediliyor olabilir. Kökenlerinden kalan eski duygular zaman zaman yüzeye çıkabilir. Kendine güvenli bir alan kurmak seni iyileştirir.",
    5: "Bu hassas nokta aşkta, yaratıcılıkta ve kendini serbestçe ifade etmede hissediliyor olabilir. Yaptıklarının değer görmeyeceği korkusu seni durdurabilir. Sonuçtan çok sürecin tadını çıkardıkça bu alan açılır.",
    6: "Bu hassas nokta günlük düzende, iş yaşamında ve bedeninle ilişkinde hissediliyor olabilir. Hep yetersiz ya da yorgun hissetmek bir döngüye dönüşebilir. Kendine merhametli bir rutin kurmak bu alanı yumuşatır.",
    7: "Bu hassas nokta yakın ilişkilerde ve ortaklıklarda hissediliyor olabilir. Tekrar eden bir kalıp seni zorlamış olabilir. Kendi sınırlarını ve ihtiyaçlarını açıkça söylemek ilişkilerini dönüştürür.",
    8: "Bu yara en çok güven, kontrolü bırakma ve derin yakınlık konularında kendini gösteriyor olabilir. Kontrolü bazen bıraktığında dünyanın yıkılmadığını gördükçe içindeki ağırlık hafifler. Zamanla aynı yükü taşıyan insanlara çok değerli bir şey verebilirsin: anlaşılmak.",
    9: "Bu hassas nokta inançlarında, hayata verdiğin anlamda ve öğrenme biçiminde hissediliyor olabilir. Neye inanacağını bilememek zaman zaman yorabilir. Merakla keşfetmek bu alanı yeniden canlandırır.",
    10: "Bu hassas nokta kariyer, başarı ve toplumdaki yerinle ilgili hissediliyor olabilir. Yeterince başarılı olamama korkusu seni zorlayabilir. Kendi başarı tanımını yazmak bu yükü hafifletir.",
    11: "Bu hassas nokta arkadaşlıklarda ve gruplara ait olma konusunda hissediliyor olabilir. Dışarıda kalma korkusu zaman zaman gelebilir. Seni olduğun gibi kabul eden küçük bir çevre sana iyi gelir.",
    12: "Bu hassas nokta yalnızlıkta, iç dünyanda ve söze dökemediğin duygularda hissediliyor olabilir. Bu duygular zaman zaman ağırlık yapabilir. Sessiz bir alanda kendini dinlemek ve gerekirse destek almak bu yolu kolaylaştırır.",
  },
};