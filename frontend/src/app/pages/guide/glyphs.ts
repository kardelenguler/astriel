import { PlanetKey } from '../../core/content/guides/sign-profiles';

// \uFE0E: sembollerin renkli emoji olarak değil, düz yazı olarak çizilmesini sağlar
export const PLANET_GLYPHS: Partial<Record<PlanetKey, string>> = {
  sun: '☉\uFE0E',
  moon: '☽\uFE0E',
  mercury: '☿\uFE0E',
  venus: '♀\uFE0E',
  mars: '♂\uFE0E',
  jupiter: '♃\uFE0E',
  saturn: '♄\uFE0E',
};

/** Burç sembolü (♈) düz yazı olarak */
export function textGlyph(glyph: string): string {
  return glyph + '\uFE0E';
}