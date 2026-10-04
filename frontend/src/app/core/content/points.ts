import { SignMeaning } from './signs';

/** Büyük üçlü: Güneş, Ay ve Yükselen */
export type PointKey = 'sun' | 'moon' | 'ascendant';

export interface PointMeaning {
  title: string;        // "Güneş"
  keywords: string;     // "Temel kimlik"
  description: string;  // noktanın genel anlamı
  area: string;         // "hayattaki yönünü belirlerken"
  /** Detay kutusundaki başlık: "Kova'da Güneş", "Yükselen İkizler" */
  heading: (sign: SignMeaning) => string;
}

export const POINT_MEANINGS: Record<PointKey, PointMeaning> = {
  sun: {
    title: 'Güneş',
    keywords: 'Temel kimlik · Yaşam enerjisi',
    description:
      'Güneş; kişinin temel kimliği, yaşam enerjisi ve hayatta neye yöneldiğiyle ilişkilendirilir.',
    area: 'hayattaki yönünü belirlerken',
    heading: (sign) => `${sign.locative} Güneş`,
  },
  moon: {
    title: 'Ay',
    keywords: 'Duygular · İç dünya',
    description:
      'Ay; kişinin duygusal dünyası, ihtiyaçları ve kendini güvende hissetme biçimiyle ilişkilendirilir.',
    area: 'duygularını yaşarken',
    heading: (sign) => `${sign.locative} Ay`,
  },
  ascendant: {
    title: 'Yükselen',
    keywords: 'Dışa yansıyan taraf · İlk izlenim',
    description:
      'Yükselen burç; kişinin dışarıya verdiği ilk izlenim, tavırları ve yeni durumlara yaklaşımıyla ilişkilendirilir.',
    area: 'dışarıya ilk izlenimini verirken',
    heading: (sign) => `Yükselen ${sign.name}`,
  },
};