/**
 * Solar Return kartlarının genel anlamları (burç ya da eve göre değişmeyen kısım).
 */
export type SolarReturnKey = 'ascendant' | 'sun' | 'moon';

export interface SolarReturnMeaning {
  title: string; // "Solar Return Yükselen"
  keywords: string; // "Yılın havası · Dış görünüm"
  description: string; // genel anlam
}

export const SOLAR_RETURN_MEANINGS: Record<SolarReturnKey, SolarReturnMeaning> = {
  ascendant: {
    title: 'Solar Return Yükselen',
    keywords: 'Yılın havası · Dış görünüm · Yaklaşım',
    description:
      'Solar Return yükseleni; yeni yaş yılında dünyaya nasıl yaklaştığınla ve çevrenin seni nasıl gördüğünle ilişkilendirilir. Yılın genel havasını ve ilk izlenimini yansıtır.',
  },
  sun: {
    title: "Güneş'in Evi",
    keywords: 'Yılın odağı · Enerjinin aktığı alan',
    description:
      "Solar Return'de Güneş'in bulunduğu ev; bu yıl dikkatin ve enerjinin en çok hangi yaşam alanına aktığıyla ilişkilendirilir. Yılın ana temasını gösterir.",
  },
  moon: {
    title: 'Solar Return Ay',
    keywords: 'Duygusal ton · İhtiyaçlar · İç dünya',
    description:
      'Solar Return Ay\'ı; bu yıl duygusal ihtiyaçlarınla ve kendini nasıl güvende hissettiğinle ilişkilendirilir. Yılın duygusal tonunu yansıtır.',
  },
};