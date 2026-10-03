import { POINT_MEANINGS } from './points';

/**
 * Gezegen parçaları. Anahtarlar backend'deki gezegen anahtarlarıyla aynıdır.
 * "area": burç cümlesindeki "Kişi ___ ..." boşluğu.
 * "themes": ev cümlesindeki "___ temalarının" boşluğu.
 */
export interface PlanetMeaning {
  title: string;
  keywords: string;
  description: string;
  area: string;
  themes: string;
}

export const PLANET_MEANINGS: Record<string, PlanetMeaning> = {
  // Güneş ve Ay'ın açıklamaları büyük üçlüyle aynı olsun diye oradan alınır
  sun: {
    title: POINT_MEANINGS.sun.title,
    keywords: POINT_MEANINGS.sun.keywords,
    description: POINT_MEANINGS.sun.description,
    area: POINT_MEANINGS.sun.area,
    themes: 'kimlik ve yaşam enerjisi',
  },
  moon: {
    title: POINT_MEANINGS.moon.title,
    keywords: POINT_MEANINGS.moon.keywords,
    description: POINT_MEANINGS.moon.description,
    area: POINT_MEANINGS.moon.area,
    themes: 'duygular ve güvenlik ihtiyacı',
  },
  mercury: {
    title: 'Merkür',
    keywords: 'İletişim · Düşünme · Öğrenme',
    description:
      'Merkür; kişinin düşünme biçimi, iletişim tarzı ve öğrenme şekliyle ilişkilendirilir.',
    area: 'düşünürken ve iletişim kurarken',
    themes: 'iletişim ve düşünme',
  },
  venus: {
    title: 'Venüs',
    keywords: 'Sevgi · Değerler · Estetik',
    description:
      'Venüs; sevgi, ilişkiler, zevkler, estetik anlayışı ve kişinin neye değer verdiğiyle ilişkilendirilir.',
    area: 'sevgisini gösterirken ve ilişki kurarken',
    themes: 'sevgi, ilişkiler ve zevkler',
  },
  mars: {
    title: 'Mars',
    keywords: 'Enerji · İrade · Harekete geçme',
    description:
      'Mars; kişinin enerjisi, isteklerinin peşinden gitme biçimi ve mücadele tarzıyla ilişkilendirilir.',
    area: 'bir şeyin peşinden giderken',
    themes: 'enerji ve harekete geçme',
  },
  jupiter: {
    title: 'Jüpiter',
    keywords: 'Büyüme · Fırsatlar · Anlam',
    description:
      'Jüpiter; büyüme, fırsatlar, iyimserlik ve kişinin hayatına anlam katma biçimiyle ilişkilendirilir.',
    area: 'fırsatları değerlendirirken ve gelişirken',
    themes: 'büyüme ve fırsatlar',
  },
  saturn: {
    title: 'Satürn',
    keywords: 'Sorumluluk · Sınırlar · Olgunluk',
    description:
      'Satürn; sorumluluklar, sınırlar, disiplin ve zamanla kazanılan olgunlukla ilişkilendirilir.',
    area: 'sorumluluk alırken ve sınırlarla karşılaştığında',
    themes: 'sorumluluk ve disiplin',
  },
  uranus: {
    title: 'Uranüs',
    keywords: 'Yenilik · Özgürlük · Değişim',
    description:
      'Uranüs; ani değişimler, yenilikler, özgürlük isteği ve kalıpların dışına çıkmayla ilişkilendirilir. ' +
      'Yavaş hareket ettiği için aynı dönemde doğan birçok kişide aynı burçtadır; burç yerleşimi kuşaksal bir anlam taşır.',
    area: 'değişime ve yeniliğe açıldığında',
    themes: 'yenilik ve özgürlük',
  },
  neptune: {
    title: 'Neptün',
    keywords: 'Hayal gücü · Sezgi · İdealler',
    description:
      'Neptün; hayal gücü, sezgiler, idealler ve kişinin ilham aldığı alanlarla ilişkilendirilir. ' +
      'Çok yavaş hareket ettiği için burç yerleşimi bir kuşağın ortak temalarını taşır.',
    area: 'hayal kurarken ve ilham ararken',
    themes: 'hayal gücü ve sezgi',
  },
  pluto: {
    title: 'Plüton',
    keywords: 'Dönüşüm · Güç · Yenilenme',
    description:
      'Plüton; köklü dönüşümler, güç, kriz anları ve yeniden doğuşla ilişkilendirilir. ' +
      'En yavaş hareket eden gezegen olduğu için burç yerleşiminin kuşaksal etkisi öne çıkar.',
    area: 'köklü değişimlerden geçerken',
    themes: 'dönüşüm ve yenilenme',
  },
  north_node: {
    title: 'Kuzey Ay Düğümü',
    keywords: 'Gelişim yönü · Hayat yolu',
    description:
      "Kuzey Ay Düğümü; kişinin gelişmeye ve büyümeye yöneldiği alanla ilişkilendirilir. " +
      "Bir gezegen değil, Ay'ın yörüngesine göre hesaplanan bir noktadır.",
    area: 'kendini geliştirmeye yöneldiğinde',
    themes: 'gelişim ve yönelim',
  },
  chiron: {
    title: 'Chiron',
    keywords: 'Hassasiyet · İyileşme',
    description:
      'Chiron; kişinin hassas noktaları ve bu noktalardan doğan iyileştirme gücüyle ilişkilendirilir.',
    area: 'hassas noktalarıyla yüzleştiğinde',
    themes: 'iyileşme ve hassasiyet',
  },
}; 