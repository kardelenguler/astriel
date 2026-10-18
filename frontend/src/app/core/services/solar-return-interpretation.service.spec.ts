import { HOUSE_MEANINGS } from '../content/houses';
import { SIGN_MEANINGS } from '../content/signs';
import { SolarReturnInterpretationService } from './solar-return-interpretation.service';

describe('SolarReturnInterpretationService', () => {
  const service = new SolarReturnInterpretationService();

  it('her burç için Yükselen ve Ay yorumu olmalı', () => {
    for (const key of Object.keys(SIGN_MEANINGS)) {
      const placement = { sign: { key }, formatted: "1°00' Test", house: null };
      expect(service.forAscendant(placement), `Yükselen: ${key}`).not.toBeNull();
      expect(service.forMoon(placement), `Ay: ${key}`).not.toBeNull();
    }
  });

  it("her ev için Güneş'in evi yorumu olmalı", () => {
    for (const house of Object.keys(HOUSE_MEANINGS).map(Number)) {
      expect(service.forSun({ formatted: "1°00' Test", house }), `Ev: ${house}`).not.toBeNull();
    }
  });

  it('ev bilinmiyorsa Güneş yorumu üretilmemeli', () => {
    expect(service.forSun({ formatted: "1°00' Test", house: null })).toBeNull();
  });

  it('başlıkları doğru kurmalı', () => {
    const aries = { sign: { key: 'aries' }, formatted: "5°00' Koç", house: 3 };
    expect(service.forAscendant(aries)?.heading).toBe("Koç'ta Yükselen");
    expect(service.forMoon(aries)?.heading).toBe("Koç'ta Ay");
    expect(service.forSun({ formatted: "5°00' Koç", house: 3 })?.heading).toBe('3. Evde Güneş');
  });

  it('Ay yorumuna ev notu eklemeli', () => {
    const moon = { sign: { key: 'aries' }, formatted: "5°00' Koç", house: 4 };
    expect(service.forMoon(moon)?.notes?.[0]).toContain('4. evde');
  });
});