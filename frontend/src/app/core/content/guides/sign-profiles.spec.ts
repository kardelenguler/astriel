import { SIGN_GUIDES } from './sign-guides';
import {
  ELEMENTS,
  MODALITIES,
  SIGN_PROFILES,
  elementText,
  findSignProfile,
  modalityText,
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

  it('aynı elementteki burçlar aynı genel cümleyle başlamalı', () => {
    for (const sign of SIGN_PROFILES) {
      expect(elementText(sign).startsWith(ELEMENTS[sign.element].base), sign.slug).toBe(true);
      expect(modalityText(sign).startsWith(MODALITIES[sign.modality].base), sign.slug).toBe(true);
    }
  });

  it('ikinci cümleler burca özel, temkinli ve birbirinden farklı olmalı', () => {
    for (const sign of SIGN_PROFILES) {
      for (const text of [sign.elementInSign, sign.modalityInSign]) {
        expect(text.startsWith(sign.name), sign.slug).toBe(true); // "Boğa'da bu enerji..."
        expect(text, sign.slug).toContain('ortaya çıkabilir'); // kesin hüküm yok
      }
    }

    const texts = SIGN_PROFILES.flatMap((sign) => [sign.elementInSign, sign.modalityInSign]);
    expect(new Set(texts).size).toBe(texts.length); // kopya metin yok
  });
});