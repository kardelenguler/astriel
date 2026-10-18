/**
 * Solar Return "Yıllık Yorum" parçaları: yılın ana teması ve yaşam alanları.
 * Metinler genel astroloji geleneğinden derlenmiş genel yorumlardır (astrolog onaylı değildir).
 */

/** Güneş'in bulunduğu eve göre yılın başlığı */
export const SUN_HOUSE_HEADLINES: Record<number, string> = {
  1: 'Yeniden başlama ve kendini tanımlama',
  2: 'Kaynaklar ve öz değer',
  3: 'İletişim ve öğrenme',
  4: 'Kökler, yuva ve güven',
  5: 'Yaratıcılık ve keyif',
  6: 'Düzen ve sağlıklı alışkanlıklar',
  7: 'İlişkiler ve ortaklıklar',
  8: 'Dönüşüm ve ortak kaynaklar',
  9: 'Keşif ve geniş ufuklar',
  10: 'Hedefler ve görünürlük',
  11: 'Sosyal çevre ve umutlar',
  12: 'İç dünya ve dinlenme',
};

export type YearAreaKey =
  | 'love'
  | 'career'
  | 'money'
  | 'home'
  | 'friends'
  | 'learning'
  | 'routine'
  | 'inner';

export interface YearAreaConfig {
  key: YearAreaKey;
  title: string;
  houses: number[]; // bu yaşam alanına bakılan evler
}

export const YEAR_AREAS: YearAreaConfig[] = [
  { key: 'love', title: 'Aşk ve İlişkiler', houses: [5, 7] },
  { key: 'career', title: 'Kariyer ve Hedefler', houses: [10] },
  { key: 'money', title: 'Para ve Maddi Konular', houses: [2, 8] },
  { key: 'home', title: 'Aile ve Yaşam Düzeni', houses: [4] },
  { key: 'friends', title: 'Arkadaşlık ve Sosyal Çevre', houses: [11] },
  { key: 'learning', title: 'Eğitim ve Kişisel Gelişim', houses: [3, 9] },
  { key: 'routine', title: 'Günlük Düzen ve Alışkanlıklar', houses: [6] },
  { key: 'inner', title: 'Yenilenme ve İç Dünya', houses: [1, 12] },
];

/** Bir alanda birden çok gezegen varsa hangisinin önce anılacağı (kişisel gezegenler önde) */
export const PLANET_PRIORITY = [
  'sun',
  'moon',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'mercury',
  'pluto',
  'uranus',
  'neptune',
];

/** "bu alanda ___ öne çıkabilir" boşluğu */
export const PLANET_TONES: Record<string, string> = {
  sun: 'dikkatin ve yaşam enerjin',
  moon: 'duygusal ihtiyaçların',
  mercury: 'konuşma, yazışma ve planlama',
  venus: 'uyum, sevgi ve keyif',
  mars: 'enerji, hareket ve rekabet',
  jupiter: 'büyüme, fırsat ve cömertlik',
  saturn: 'sorumluluk, sınırlar ve sabır',
  uranus: 'beklenmedik değişiklikler ve özgürlük arzusu',
  neptune: 'hayal gücü, sezgi ve belirsizlik',
  pluto: 'derin dönüşüm ve yüzleşme',
};

/** Gezegene göre kısa yönlendirme cümlesi */
export const PLANET_ADVICE: Record<string, string> = {
  sun: 'Enerjini bu alana bilinçli olarak yönlendirmek yıl boyunca seni besler.',
  moon: 'Duygularına kulak vermek bu alandaki kararlarında sana yol gösterebilir.',
  mercury: 'Düşüncelerini açıkça konuşmak ve plan yapmak işine yarayabilir.',
  venus: 'Uyumu ve keyfi ihmal etmemek bu alanı güzelleştirebilir.',
  mars: 'Harekete geçmek iyi gelir, ama aceleci ya da sert davranmamaya dikkat et.',
  jupiter: 'Fırsatlara açık ol; yine de abartıya kaçmamak önemli.',
  saturn: 'Sabırlı ve düzenli adımlar uzun vadede karşılığını verebilir.',
  uranus: 'Beklenmedik gelişmelere esnek yaklaşmak sana yardımcı olur.',
  neptune: 'Hayallerini somut adımlara bağlamak belirsizlikte yolunu bulmana yardım edebilir.',
  pluto: 'Eskiyi bırakıp yenilenmeye açık olmak bu alanda güçlü bir dönüşüm getirebilir.',
};

/** Geri hareketli (retro) gezegen varsa eklenen not */
export const RETROGRADE_NOTE =
  'Geri hareketli olan gezegenler nedeniyle bu konuları acele etmeden, gözden geçirerek ele almak daha iyi olabilir.';

/** Alanda hiç gezegen yoksa gösterilen metin */
export const EMPTY_AREA_TEXT =
  'Bu yıl bu alanda belirgin bir gezegen vurgusu yok. Konular daha sakin ilerleyebilir; ' +
  'yılın asıl gündemi başka alanlarda olabilir.';