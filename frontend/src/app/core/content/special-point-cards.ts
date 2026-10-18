import { ChartResponse, Sign } from '../models/chart';
import { specialPointText } from './special-point-texts';
import { SPECIAL_POINTS, SpecialPointInfo } from './special-points';

/** Ekranda çizilecek bir kart: sabit bilgi + haritadaki gerçek konum + yorum */
export interface SpecialPointCard {
  info: SpecialPointInfo;
  /** Kilitli kartta (doğum saati yok) null */
  sign: Sign | null;
  formatted: string; // "3°30' Aslan"; kilitli kartta boş
  house: number | null; // doğum saati bilinmiyorsa null
  /** Burç + ev yorumu; bu nokta için metin yazılmadıysa veya kart kilitliyse null */
  text: string | null;
  /** true: nokta doğum saati gerektiriyor ve saat girilmemiş */
  locked: boolean;
}

/**
 * Haritadaki özel noktaları kart listesine çevirir (SPECIAL_POINTS sırasıyla).
 *
 * - Şans Noktası: doğum saati yoksa kilitli kart olarak gösterilir (hep 6 kart kalır).
 * - Bir nokta hesaplanamadıysa veya eski bir kayıtta yoksa (ör. Juno): atlanır,
 *   diğer kartlar yine görünür.
 */
export function buildSpecialPointCards(chart: ChartResponse): SpecialPointCard[] {
  const cards: SpecialPointCard[] = [];

  for (const info of SPECIAL_POINTS) {
    if (info.needsBirthTime && !chart.time_known) {
      cards.push({ info, sign: null, formatted: '', house: null, text: null, locked: true });
      continue;
    }

    const source = info.source === 'planet' ? chart.planets : (chart.special_points ?? []);
    const point = source.find((item) => item.key === info.key);
    if (!point) {
      continue;
    }

    const house = chart.time_known ? point.house : null;
    cards.push({
      info,
      sign: point.sign,
      formatted: point.formatted,
      house,
      text: specialPointText(info.key, point.sign.key, house),
      locked: false,
    });
  }

  return cards;
}