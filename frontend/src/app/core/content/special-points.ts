/**
 * Özel noktaların sabit bilgileri: sembol, ad ve kısa tanıtım ("Bu nedir").
 *
 * Kartların sırası aşağıdaki listenin sırasıdır.
 * Veri iki yerden gelir (backend'e göre):
 *   'planet'  -> Kuzey Düğüm ve Kiron (Chiron), `chart.planets` içinde
 *   'special' -> diğerleri, `chart.special_points` içinde
 */

export type SpecialPointKey =
  | 'north_node'
  | 'south_node'
  | 'lilith'
  | 'part_of_fortune'
  | 'chiron'
  | 'juno';

export interface SpecialPointInfo {
  key: SpecialPointKey;
  title: string; // "Kuzey Düğüm"
  /** \uFE0E: sembolün renkli emoji değil, düz yazı olarak çizilmesini sağlar */
  glyph: string;
  /** Kartın italik tanıtım satırı ("Bu nedir"), 2 tam cümle */
  intro: string;
  source: 'planet' | 'special';
  /** true: doğum saati olmadan hesaplanamaz, kart kilitli (soluk) görünür */
  needsBirthTime: boolean;
}

export const SPECIAL_POINTS: readonly SpecialPointInfo[] = [
  {
    key: 'north_node',
    title: 'Kuzey Düğüm',
    glyph: '☊\uFE0E',
    intro:
      'Hayatta büyümek için yöneldiğin yönü anlatır. Başta zor gelse de seni en çok geliştirecek alan burasıdır.',
    source: 'planet',
    needsBirthTime: false,
  },
  {
    key: 'south_node',
    title: 'Güney Düğüm',
    glyph: '☋\uFE0E',
    intro:
      'Sana en tanıdık gelen alışkanlıklarını anlatır. Burada rahat edersin, ama fazla takılıp kalırsan ilerlemen durabilir.',
    source: 'special',
    needsBirthTime: false,
  },
  {
    key: 'lilith',
    title: 'Lilit',
    glyph: '⚸\uFE0E',
    intro:
      'Sakladığın ya da göstermekte zorlandığın yanlarını anlatır. Onları tanımak kendinle barışmana yardım eder.',
    source: 'special',
    needsBirthTime: false,
  },
  {
    key: 'part_of_fortune',
    title: 'Şans Noktası',
    glyph: '⊗\uFE0E',
    intro:
      'Kendini en rahat ve şanslı hissettiğin alanı gösterir. Hayatın sana en kolay aktığı yer burasıdır.',
    source: 'special',
    needsBirthTime: true,
  },
  {
    key: 'chiron',
    title: 'Kiron',
    glyph: '⚷\uFE0E',
    intro:
      'Hayatta seni en çok zorlayan konuyu anlatır. Aynı zamanda bu deneyimden doğan iyileştirme gücünü de gösterir.',
    source: 'planet',
    needsBirthTime: false,
  },
  {
    key: 'juno',
    title: 'Juno',
    glyph: '⚵\uFE0E',
    intro:
      'İlişkide neye ihtiyaç duyduğunu anlatır. Nasıl bir bağda kendini mutlu ve güvende hissettiğini gösterir.',
    source: 'special',
    needsBirthTime: false,
  },
];