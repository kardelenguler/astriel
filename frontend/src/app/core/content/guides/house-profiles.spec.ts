import { HOUSE_GUIDES } from './house-guides';
import { HOUSE_PROFILES, findHouseProfile, oppositeHouse, oppositeText } from './house-profiles';
import { SIGN_PROFILES } from './sign-profiles';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

describe('Ev profilleri', () => {
  it('12 ev, rehber sayfalarıyla aynı sırada ve aynı adreslerle olmalı', () => {
    expect(HOUSE_PROFILES.map((house) => house.slug)).toEqual(
      HOUSE_GUIDES.items.map((item) => item.slug),
    );
    HOUSE_PROFILES.forEach((house, i) => {
      expect(house.number).toBe(i + 1);
      expect(house.roman).toBe(ROMAN[i]);
    });
  });

  it('her evin doğal burcu var ve sırası zodyakla aynı', () => {
    HOUSE_PROFILES.forEach((house, i) => {
      expect(house.naturalSign, house.slug).toBe(SIGN_PROFILES[i].slug);
    });
  });

  it('sadece köşe evlerinin (1, 4, 7, 10) başlangıç noktası olmalı', () => {
    const withAngle = HOUSE_PROFILES.filter((house) => house.angle).map((house) => house.number);
    expect(withAngle).toEqual([1, 4, 7, 10]);
    for (const house of HOUSE_PROFILES) {
      expect(house.group === 'angular', house.slug).toBe(Boolean(house.angle));
    }
  });

  it('her evin 6+6 farklı ve kısa etiketi, 2+2 örneği olmalı', () => {
    for (const house of HOUSE_PROFILES) {
      expect(house.themes.length, house.slug).toBe(6);
      expect(house.areas.length, house.slug).toBe(6);
      expect(new Set([...house.themes, ...house.areas]).size, house.slug).toBe(12);
      for (const topic of [...house.themes, ...house.areas]) {
        expect(topic.length, topic).toBeLessThanOrEqual(16);
      }
      expect(house.cuspExamples.length, house.slug).toBe(2);
      expect(house.planetExamples.length, house.slug).toBe(2);
    }
  });

  it('karşıt evler karşılıklı olmalı ve aynı temayı paylaşmalı', () => {
    for (const house of HOUSE_PROFILES) {
      const other = oppositeHouse(house);
      expect(Math.abs(other.number - house.number), house.slug).toBe(6);
      expect(oppositeHouse(other)).toBe(house);
      expect(other.oppositeTheme, house.slug).toBe(house.oppositeTheme);
    }
  });

  it('karşıt ev metni iki evden üretilmeli', () => {
    expect(oppositeText(findHouseProfile('7-ev')!)).toBe(
      '7. ev karşındaki kişileri ve yakın ilişkilerini, karşısındaki 1. ev ise seni ve kendini dünyaya nasıl gösterdiğini anlatır. ' +
        'İkisi birlikte "ben ve biz" dengesini oluşturur.',
    );
  });
});