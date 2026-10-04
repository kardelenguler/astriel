/**
 * Ev parçaları (1–12).
 * "area", burç cümlesinde "Kişi ___ ..." boşluğuna gelen ifadedir.
 */
export interface HouseMeaning {
  title: string;        // kısa başlık: "Benlik"
  keywords: string;     // "Benlik · Kendini ifade etme"
  description: string;  // evin genel anlamı
  area: string;         // "kendini ifade ederken"
}

export const HOUSE_MEANINGS: Record<number, HouseMeaning> = {
  1: {
    title: 'Benlik',
    keywords: 'Benlik · Kendini ifade etme',
    description:
      '1. ev; kişinin kendini ifade etme biçimi, dışarıya yansıttığı tarafı ve hayata yaklaşımıyla ilişkilendirilir.',
    area: 'kendini ifade ederken',
  },
  2: {
    title: 'Kaynaklar',
    keywords: 'Para · Sahip olunanlar · Değerler',
    description:
      '2. ev; para, maddi kaynaklar, sahip olunanlar ve kişinin neye değer verdiğiyle ilişkilendirilir.',
    area: 'para ve sahip oldukları söz konusu olduğunda',
  },
  3: {
    title: 'İletişim',
    keywords: 'İletişim · Öğrenme · Yakın çevre',
    description:
      '3. ev; iletişim, öğrenme, düşünme biçimi ve kardeşler, komşular gibi yakın çevreyle ilişkilendirilir.',
    area: 'iletişim kurarken ve öğrenirken',
  },
  4: {
    title: 'Kökler',
    keywords: 'Ev · Aile · Özel hayat',
    description:
      '4. ev; ev, aile, kökler ve özel hayatla ilişkilendirilir. Kişinin kendini güvende hissettiği alanı temsil eder.',
    area: 'evinde ve ailesiyle ilişkilerinde',
  },
  5: {
    title: 'Yaratıcılık',
    keywords: 'Aşk · Yaratıcılık · Eğlence',
    description:
      '5. ev; aşk, yaratıcılık, hobiler, eğlence ve kişinin kendini ortaya koymasıyla ilişkilendirilir.',
    area: 'aşkta, yaratıcılıkta ve eğlencede',
  },
  6: {
    title: 'Günlük düzen',
    keywords: 'Rutinler · Çalışma · Sorumluluklar',
    description:
      '6. ev; günlük düzen, çalışma hayatı, sorumluluklar ve alışkanlıklarla ilişkilendirilir.',
    area: 'günlük işlerinde ve sorumluluklarında',
  },
  7: {
    title: 'İlişkiler',
    keywords: 'Ortaklıklar · Evlilik · Birebir bağlar',
    description:
      '7. ev; evlilik, ortaklıklar ve birebir kurulan bağlarla ilişkilendirilir. Kişinin başkalarıyla nasıl bağ kurduğunu temsil eder.',
    area: 'ilişkilerinde ve ortaklıklarında',
  },
  8: {
    title: 'Dönüşüm',
    keywords: 'Paylaşım · Ortak kaynaklar · Dönüşüm',
    description:
      '8. ev; paylaşım, ortak kaynaklar, mahremiyet ve köklü değişimlerle ilişkilendirilir.',
    area: 'paylaşım ve derin bağlar söz konusu olduğunda',
  },
  9: {
    title: 'Ufuklar',
    keywords: 'Yüksek öğrenim · Uzaklar · İnançlar',
    description:
      '9. ev; yüksek öğrenim, uzak yolculuklar, inançlar ve dünya görüşüyle ilişkilendirilir.',
    area: 'dünyayı keşfederken ve anlam ararken',
  },
  10: {
    title: 'Kariyer',
    keywords: 'Kariyer · Hedefler · Toplumdaki rol',
    description:
      '10. ev; kariyer, hedefler, başarı ve kişinin toplumdaki rolüyle ilişkilendirilir.',
    area: 'kariyerinde ve hedeflerine ilerlerken',
  },
  11: {
    title: 'Topluluk',
    keywords: 'Arkadaşlar · Gruplar · Gelecek hedefleri',
    description:
      '11. ev; arkadaşlar, sosyal çevre, içinde bulunulan gruplar ve gelecekle ilgili umutlarla ilişkilendirilir.',
    area: 'arkadaşlarıyla ve sosyal çevresinde',
  },
  12: {
    title: 'İç dünya',
    keywords: 'Bilinçdışı · İç dünya · Geri çekilme',
    description:
      '12. ev; iç dünya, bilinçdışı, yalnız kalma ihtiyacı ve kişinin geri çekildiği alanla ilişkilendirilir.',
    area: 'kendi iç dünyasına döndüğünde',
  },
};