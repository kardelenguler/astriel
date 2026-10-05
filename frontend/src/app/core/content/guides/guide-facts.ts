import { GuideFact } from '../../models/guide';
import { ELEMENTS, MODALITIES, SIGN_PROFILES, rulerName } from './sign-profiles';

/**
 * Rehber sayfalarının bilgi şeridi (adres -> satırlar) ve liste kartlarındaki semboller.
 * Burç bilgileri sign-profiles.ts'ten gelir; ev bilgileri bu dosyadadır.
 */

const ANGLES: Record<string, string> = {
  '1-ev': 'Yükselen (ASC)',
  '4-ev': 'Gökyüzünün Dibi (IC)',
  '7-ev': 'Alçalan (DSC)',
  '10-ev': 'Tepe Noktası (MC)',
};

// [ev no, doğal burç, doğal yönetici, ev grubu]
const HOUSES: [number, string, string, string][] = [
  [1, 'Koç', 'Mars', 'Köşe Evi'],
  [2, 'Boğa', 'Venüs', 'Ardıl Ev'],
  [3, 'İkizler', 'Merkür', 'Düşen Ev'],
  [4, 'Yengeç', 'Ay', 'Köşe Evi'],
  [5, 'Aslan', 'Güneş', 'Ardıl Ev'],
  [6, 'Başak', 'Merkür', 'Düşen Ev'],
  [7, 'Terazi', 'Venüs', 'Köşe Evi'],
  [8, 'Akrep', 'Mars (Modern: Plüton)', 'Ardıl Ev'],
  [9, 'Yay', 'Jüpiter', 'Düşen Ev'],
  [10, 'Oğlak', 'Satürn', 'Köşe Evi'],
  [11, 'Kova', 'Satürn (Modern: Uranüs)', 'Ardıl Ev'],
  [12, 'Balık', 'Jüpiter (Modern: Neptün)', 'Düşen Ev'],
];

const HOUSE_FACTS: Record<string, GuideFact[]> = Object.fromEntries(
  HOUSES.map(([no, sign, ruler, group]) => {
    const slug = `${no}-ev`;
    const facts: GuideFact[] = [
      { label: 'Doğal Burç', value: sign },
      { label: 'Doğal Yönetici', value: ruler },
      { label: 'Ev Grubu', value: group },
    ];
    if (ANGLES[slug]) {
      facts.push({ label: 'Başlangıç Noktası', value: ANGLES[slug] });
    }
    return [slug, facts];
  }),
);

// Burç bilgileri tek yerden (sign-profiles.ts) gelir; burada tekrar yazılmaz
const SIGN_FACTS: Record<string, GuideFact[]> = Object.fromEntries(
  SIGN_PROFILES.map((sign) => [
    sign.slug,
    [
      { label: 'Tarih', value: `${sign.dates} (yaklaşık)` },
      { label: 'Element', value: ELEMENTS[sign.element].name },
      { label: 'Nitelik', value: MODALITIES[sign.modality].name },
      { label: 'Yönetici Gezegen', value: rulerName(sign) },
    ],
  ]),
);

/** Tüm rehber sayfalarının bilgi kutuları (adresler benzersiz: "7-ev", "akrep") */
export const GUIDE_FACTS: Record<string, GuideFact[]> = { ...HOUSE_FACTS, ...SIGN_FACTS };

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Liste kartlarındaki sembol: burçlar için burç işareti, evler için Roma rakamı */
export const GUIDE_SYMBOLS: Record<string, string> = Object.fromEntries([
  // \uFE0E: sembollerin renkli emoji olarak değil, düz yazı olarak çizilmesini sağlar
  ...SIGN_PROFILES.map((sign) => [sign.slug, sign.glyph + '\uFE0E']),
  ...HOUSES.map(([no]) => [`${no}-ev`, ROMAN[no - 1]]),
]);