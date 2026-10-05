import { SIGN_GUIDES } from './sign-guides';
import {
  ELEMENTS,
  MODALITIES,
  PLANETS,
  SIGN_PROFILES,
  elementText,
  findSignProfile,
  modalityText,
  rulerName,
  rulerText,
} from './sign-profiles';

describe('Burç profilleri', () => {
  it('12 burç, rehber sayfalarıyla aynı sırada ve aynı adreslerle olmalı', () => {
    expect(SIGN_PROFILES.map((sign) => sign.slug)).toEqual(
      SIGN_GUIDES.items.map((item) => item.slug),
    );
  });

  it('element metni: önce elementin genel anlamı, sonra burca özel cümle', () => {
    const boga = findSignProfile('boga')!;

    expect(elementText(boga)).toBe(
      "Toprak elementi; güven, pratiklik, istikrar ve somutluk temalarıyla ilişkilendirilir. Boğa'da bu enerji, güvenli ve sağlam bir yaşam kurma, konforu koruma ve somut sonuçlara önem verme şeklinde ortaya çıkabilir.",
    );
  });

  it('aynı element, nitelik ve gezegendeki burçlar aynı genel cümleyle başlamalı', () => {
    for (const sign of SIGN_PROFILES) {
      expect(elementText(sign).startsWith(ELEMENTS[sign.element].base), sign.slug).toBe(true);
      expect(modalityText(sign).startsWith(MODALITIES[sign.modality].base), sign.slug).toBe(true);
      expect(rulerText(sign).startsWith(PLANETS[sign.ruler].base!), sign.slug).toBe(true);
    }
  });

  it('modern yöneticisi olan burçlarda ikisi birlikte yazılmalı', () => {
    expect(rulerName(findSignProfile('akrep')!)).toBe('Mars (Modern: Plüton)');
    expect(rulerName(findSignProfile('boga')!)).toBe('Venüs');
  });

  it('her burçta 6 güçlü yön ve 6 dikkat edilmesi gereken, tekrarsız olmalı', () => {
    for (const sign of SIGN_PROFILES) {
      expect(sign.strengths.length, sign.slug).toBe(6);
      expect(sign.cautions.length, sign.slug).toBe(6);
      expect(new Set([...sign.strengths, ...sign.cautions]).size, sign.slug).toBe(12);
    }
  });

  it('ikinci cümleler burca özel, temkinli ve birbirinden farklı olmalı', () => {
    for (const sign of SIGN_PROFILES) {
      for (const text of [sign.elementInSign, sign.modalityInSign]) {
        expect(text.startsWith(sign.name), sign.slug).toBe(true); // "Boğa'da bu enerji..."
        expect(text, sign.slug).toContain('ortaya çıkabilir'); // kesin hüküm yok
      }
      expect(sign.rulerInSign.startsWith(sign.name), sign.slug).toBe(true);
    }

    const texts = SIGN_PROFILES.flatMap((sign) => [
      sign.elementInSign,
      sign.modalityInSign,
      sign.rulerInSign,
      ...Object.values(sign.inChart),
    ]);
    expect(new Set(texts).size).toBe(texts.length); // kopya metin yok
  });
});