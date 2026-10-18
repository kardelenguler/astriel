import { PointTexts } from './types';

/**
 * Lilit: sakladığın ya da göstermekte zorlandığın yanlar.
 * Burç metni 4 cümle, ev metni 3 cümle; kartta art arda tek paragraf olarak gösterilir.
 * Burç metni evden, ev metni burçtan bahsetmez: her kombinasyonda doğal okunmalı.
 * Dil kuralı: kişilikle ilgili iddialarda temkinli ("olabilirsin"), yol gösteren
 * cümlelerde net. "Olabilir" cümlelerin yaklaşık yarısında kullanılır.
 */
export const LILITH_TEXTS: PointTexts = {
  signs: {
    aries:
      "İçinde öfkeni, isteklerini ve “hayır” deme gücünü yumuşatan bir ses taşıyor olabilirsin. Çatışmadan kaçınmayı ya da kendini geri çekmeyi belki erken öğrenmişsindir. Oysa bu ateşli taraf bastırılacak bir şey değil, yönlendirilecek bir enerjidir. Net bir sınır çizdiğinde ne kadar güçlendiğini hissedersin.",
    taurus:
      "Arzularını, ihtiyaçlarını ve neye değer verdiğini açıkça söylemek sana zor gelmiş olabilir. Fazla istediğinde bencil sayılacağından çekinmiş olabilirsin. Oysa bedensel zevklerin, huzurun ve sahip olduğun şeylerin sana ait olduğunu bilmek yerinde bir sahiplenmedir. Kendine bir şeyi gerçekten hak ettiğin için vermek içindeki gerginliği yumuşatır.",
    gemini:
      "Aklından geçenleri olduğu gibi söylemek, bazen yanlış anlaşılacağın korkusuyla sana zor gelir. Kendi sesini yumuşatıp daha “kabul edilir” bir dille konuşmayı öğrenmiş olabilirsin. Oysa keskin zekân, alaycı espri anlayışın ve merakın senin özgün yanın. Düşündüğünü süslemeden paylaştığında insanlar seni daha çok dinler.",
    cancer:
      "Duygularını bir kabuğun içinde saklamayı erken öğrenmiş olabilirsin; kırılgan görünmek sana bir zamanlar riskli gelmiş olabilir. Dışarıdan sakin ve güçlü görünürken içinde çok daha derin bir dünya taşıyorsun. Bu hassasiyet saklaman gereken bir şey değil, senin imzan. Onu sakladıkça yorulur, gösterdikçe hafiflersin.",
    leo:
      "Parlamak, görünür olmak ve kendini beğenmek sana “fazla” gelmiş olabilir. Dikkat çekmenin eleştirileceğinden çekinip kendini küçültmüş olabilirsin. Oysa gösterişli, dramatik ve coşkulu yanın saklanması gereken bir kusur değil. Kendi ışığını açtığında çevrendekilerin de rahatladığını görürsün.",
    virgo:
      "Kusursuz olmak zorunda olduğunu hissetmek sana ağır gelmiş olabilir. Dağınık, yorgun ya da yetersiz hissettiğin yanların için kendini sert eleştiriyor olabilirsin. Oysa mükemmel olmayan taraflarında da insani bir çekicilik var. Kendine “yeterince iyisin” demeyi öğrendikçe içindeki baskı gevşer.",
    libra:
      "Herkesle uyumlu olmak için kendi öfkeni, itirazını ya da farklı isteğini saklamış olabilirsin. Dengeyi korumak uğruna kendi sesini kıstığın anlar olmuştur. Oysa nazik biri olmak, itiraz etmeyi bırakmak anlamına gelmez. Kendi isteğini açıkça söylediğinde ilişkilerin daha dürüst bir zemine oturur.",
    scorpio:
      "Yoğun duygularını, kıskançlığını ya da gücünü gizlemeyi öğrenmiş olabilirsin. İçindeki derinlik bazen korkutucu gelmiş, bu yüzden perde çekmişsindir. Oysa bu yoğunluk, tutkunun ve sezginin kaynağı. Onu bastırmak yerine bilinçle kullandığında kendini çok daha güçlü hissedersin.",
    sagittarius:
      "Özgürlüğünü, doğrudan konuşma tarzını ve sınır tanımayan yanını yumuşatmış olabilirsin. Fazla açık sözlü ya da fazla bağımsız bulunacağından çekinmiş olabilirsin. Oysa dürüstlüğün ve geniş bakışın çevrendekilere ilham verir. Kendi gerçeğini cesaretle söylediğinde doğru insanlar yanında kalır.",
    capricorn:
      "Güçsüz, ihtiyaç sahibi ya da kontrolsüz görünmek sana çok riskli gelmiş olabilir. Duygularını bastırıp hep sağlam durmayı seçmiş olabilirsin. Oysa içindeki hırs ve otorite, saklaman gereken değil sahiplenmen gereken bir güç. Yardım isteyebildiğinde gücünün azalmadığını, arttığını görürsün.",
    aquarius:
      "Farklı olmanın, sıra dışı fikirlerinin ya da duygusal mesafeni korumanın seni dışarıda bırakacağını hissetmiş olabilirsin. Bu yüzden “normal” görünmeye çalıştığın zamanlar olmuş olabilir. Oysa özgün ve aykırı yanın senin en değerli tarafın. Kendin gibi davrandığında seni anlayan insanlar sana yaklaşır.",
    pisces:
      "Hayallerini, hassasiyetini ve sınırlarının kolay bulanıklaşan yanını gizlemiş olabilirsin. Fazla duygusal ya da saf görüneceğinden çekinmiş olabilirsin. Oysa sezgin ve şefkatin güçlü bir bilgelik taşır. Hayal gücüne ve iç sesine güvendiğinde yolunu daha kolay bulursun.",
  },
  houses: {
    1: "Bu taraf en çok kendini gösterdiğin, ilk izlenim bıraktığın anlarda geri çekiliyor olabilir. Biri sana gerçekten “nasılsın?” diye sorduğunda kısa kesmek yerine biraz daha anlatmayı denemek iyi gelir. Kendini olduğun gibi gösterdiğinde insanlar seni en çok o hâlinle hatırlar.",
    2: "Bu taraf para, değer ve sahip olduğun şeylerle ilişkinde saklı kalıyor olabilir. Ne istediğini ve neyi hak ettiğini açıkça söylemek sana zor gelebilir. Kendi değerini kimseden onay beklemeden belirlemek sana güç verir.",
    3: "Bu taraf konuşurken, yazarken ve fikrini paylaşırken kendini tutuyor olabilir. Aklından geçeni olduğu gibi söylemek ilk başta cesaret ister. Kendi sesini bulduğunda söylediklerin daha çok ağırlık taşır.",
    4: "Bu taraf ev, aile ve çocukluk hatıralarında saklı olabilir. Evde söyleyemediğin ya da yutkunduğun şeylerin bugün de seni etkilemesi mümkün. Kendi güvenli alanını kurmak bu tarafı özgürce yaşamana izin verir.",
    5: "Bu taraf eğlenirken, aşkta ve yaratıcı alanlarda kendini kısıtlıyor olabilir. Gerçekten istediğin gibi sevmek ve yaratmak ilk bakışta riskli gelebilir. Kimseyi etkilemeye çalışmadan yaptığın şeyler sana en çok ait olan şeylerdir.",
    6: "Bu taraf günlük düzende, işte ve bedeninle kurduğun ilişkide saklı olabilir. Hep verimli ve düzenli olmak zorunda hissetmek seni yorabilir. Dinlenmeyi ve kendi ritmini seçmek bu tarafı rahatlatır.",
    7: "Bu taraf ilişkilerde, özellikle yakın bağlarda gizleniyor olabilir. Partnerine ya da yakınına gerçek isteklerini söylemek zor gelebilir. Dürüstçe konuştukça ilişkiler daha derin ve sahici olur.",
    8: "Bu taraf yoğun duygularında, yakınlıkta ve güven konularında saklı olabilir. Ne kadar derin hissettiğini göstermek ilk başta savunmasız bırakabilir. Güvendiğin biriyle bu derinliği paylaşmak seni özgürleştirir.",
    9: "Bu taraf inançlarında, düşünce özgürlüğünde ve dünya görüşünde kendini tutuyor olabilir. Farklı düşündüğünü söylemek bazen riskli görünebilir. Kendi doğrunu bulmak ve sahiplenmek ufkunu açar.",
    10: "Bu taraf kariyer, görünürlük ve toplum karşısındaki imajında saklı olabilir. Güçlü ya da hırslı görünmek sana ağır gelebilir. Kendi başarı anlayışını açıkça sahiplenmek yolunu netleştirir.",
    11: "Bu taraf arkadaşlıklarda ve topluluk içinde kendini gizliyor olabilir. Gruba uyum sağlamak için farklı yanlarını geri planda tutmuş olabilirsin. Kendin gibi olduğunda seni gerçekten anlayan insanlarla buluşursun.",
    12: "Bu taraf iç dünyanda, rüyalarında ve yalnız kaldığında yaşıyor olabilir. Sakladığın duygular bazen sessizce ağırlık yapar. Onlara sessiz bir alan açmak kendinle barışmanı kolaylaştırır.",
  },
};