import { SpecialPointKey } from '../special-points';
import { CHIRON_TEXTS } from './chiron';
import { JUNO_TEXTS } from './juno';
import { LILITH_TEXTS } from './lilith';
import { NORTH_NODE_TEXTS } from './north-node';
import { PART_OF_FORTUNE_TEXTS } from './part-of-fortune';
import { SOUTH_NODE_TEXTS } from './south-node';
import { PointTexts } from './types';

const TEXTS: Record<SpecialPointKey, PointTexts> = {
  north_node: NORTH_NODE_TEXTS,
  south_node: SOUTH_NODE_TEXTS,
  lilith: LILITH_TEXTS,
  part_of_fortune: PART_OF_FORTUNE_TEXTS,
  chiron: CHIRON_TEXTS,
  juno: JUNO_TEXTS,
};

/**
 * Kartın yorum metni: burç metni + (doğum saati biliniyorsa) ev metni.
 * Metin henüz yazılmamışsa null döner; kart yorumsuz çizilir.
 */
export function specialPointText(
  key: SpecialPointKey,
  signKey: string,
  house: number | null,
): string | null {
  const texts = TEXTS[key];
  const signText = texts.signs[signKey];
  if (!signText) {
    return null;
  }
  const houseText = house === null ? undefined : texts.houses[house];
  return houseText ? `${signText} ${houseText}` : signText;
}