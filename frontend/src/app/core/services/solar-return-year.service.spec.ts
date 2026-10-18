import { TestBed } from '@angular/core/testing';

import { YEAR_AREAS } from '../content/solar-return-texts/year';
import {
  EMPTY_AREA_TEXTS,
  HOUSE_THEMES,
  PLANET_CLOSING,
  PLANET_LINES,
  SIGN_STYLES,
} from '../content/solar-return-texts/year-areas';
import { ChartResponse } from '../models/chart';
import { SolarReturnYearService } from './solar-return-year.service';

interface SignLike {
  key: string;
  name: string;
}

const CANCER: SignLike = { key: 'cancer', name: 'Yengeç' };
const ARIES: SignLike = { key: 'aries', name: 'Koç' };

function planet(
  key: string,
  name: string,
  house: number | null,
  retrograde = false,
  sign: SignLike = CANCER,
) {
  return { key, name, house, retrograde, sign };
}

/** 12 evin hepsi aynı burçta başlıyor */
function cusps(sign: SignLike) {
  return Array.from({ length: 12 }, () => ({ sign }));
}

function chartOf(
  planets: ReturnType<typeof planet>[],
  aspects: { first: string; second: string; orb: number; type: { key: string; name: string } }[] = [],
  houses: { sign: SignLike }[] = cusps(ARIES),
): ChartResponse {
  return {
    planets,
    aspects,
    houses,
    ascendant: { sign: CANCER },
  } as unknown as ChartResponse;
}

describe('SolarReturnYearService', () => {
  let service: SolarReturnYearService;

  beforeEach(() => {
    service = TestBed.inject(SolarReturnYearService);
  });

  describe('theme', () => {
    it('Güneş evi varsa başlık ve etiketler üretir', () => {
      const chart = chartOf([planet('sun', 'Güneş', 4), planet('moon', 'Ay', 12)]);
      const theme = service.theme(chart);
      expect(theme?.headline).toBeTruthy();
      expect(theme?.text).toBeTruthy();
      expect(theme?.tags).toContain('4. ev vurgusu');
      expect(theme?.tags).toContain('Yengeç Yükselen');
    });

    it('Güneş evi yoksa null döner', () => {
      expect(service.theme(chartOf([planet('sun', 'Güneş', null)]))).toBeNull();
    });

    it("Güneş'e dar açı varsa etiket ekler", () => {
      const chart = chartOf(
        [planet('sun', 'Güneş', 4), planet('pluto', 'Plüton', 4)],
        [{ first: 'sun', second: 'pluto', orb: 1.2, type: { key: 'conjunction', name: 'Kavuşum' } }],
      );
      expect(service.theme(chart)?.tags).toContain('Güneş – Plüton · Kavuşum');
    });

    it('geniş açı için etiket eklemez', () => {
      const chart = chartOf(
        [planet('sun', 'Güneş', 4), planet('pluto', 'Plüton', 4)],
        [{ first: 'sun', second: 'pluto', orb: 5, type: { key: 'conjunction', name: 'Kavuşum' } }],
      );
      expect(service.theme(chart)?.tags.some((t) => t.includes('Plüton'))).toBe(false);
    });
  });

  describe('areas', () => {
    it('evler bilinmiyorsa boş liste döner', () => {
      expect(service.areas(chartOf([planet('sun', 'Güneş', null)]))).toEqual([]);
    });

    it('sekiz alan üretir', () => {
      expect(service.areas(chartOf([planet('sun', 'Güneş', 4)]))).toHaveLength(8);
    });

    it('tek gezegen: ev teması, gezegen katkısı ve kapanış birleşir', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const love = areas.find((a) => a.key === 'love');
      expect(love?.subtitle).toBe('Venüs · 7. ev');
      expect(love?.text).toContain(HOUSE_THEMES[7]);
      expect(love?.text).toContain(PLANET_LINES['venus']);
      expect(love?.text).toContain(PLANET_CLOSING['venus']);
    });

    it('ana gezegenin burcuna göre tarz cümlesi eklenir', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7, false, ARIES)]));
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text).toContain('Venüs Koç burcunda olduğu için');
      expect(love?.text).toContain(SIGN_STYLES['aries']);
    });

    it('farklı burç farklı yorum üretir', () => {
      const pisces: SignLike = { key: 'pisces', name: 'Balık' };
      const a = service.areas(chartOf([planet('venus', 'Venüs', 7, false, ARIES)]));
      const b = service.areas(chartOf([planet('venus', 'Venüs', 7, false, pisces)]));
      expect(a.find((x) => x.key === 'love')?.text).not.toBe(
        b.find((x) => x.key === 'love')?.text,
      );
    });

    it('bilinmeyen burçta tarz cümlesi atlanır', () => {
      const unknown: SignLike = { key: 'unknown', name: '?' };
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7, false, unknown)]));
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text).not.toContain('burcunda olduğu için');
    });

    it('ikinci gezegen "Ayrıca" ile eklenir', () => {
      const areas = service.areas(
        chartOf([planet('venus', 'Venüs', 7), planet('mars', 'Mars', 5)]),
      );
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text).toContain('Ayrıca');
      expect(love?.text).toContain(PLANET_LINES['venus']);
      expect(love?.text).toContain(PLANET_LINES['mars']);
    });

    it('üçüncü gezegen ismen anılır', () => {
      const areas = service.areas(
        chartOf([
          planet('venus', 'Venüs', 7),
          planet('mars', 'Mars', 5),
          planet('jupiter', 'Jüpiter', 7),
        ]),
      );
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text).toContain('Bu alanda ayrıca');
    });

    it('geri hareketteki gezegen için not ekler', () => {
      const areas = service.areas(chartOf([planet('saturn', 'Satürn', 10, true)]));
      const career = areas.find((a) => a.key === 'career');
      expect(career?.text).toContain('geri hareket');
    });

    it('özet metnin ilk cümlesidir', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text.startsWith(love?.summary ?? '')).toBe(true);
    });
  });

  describe('gezegeni olmayan alanlar', () => {
    it('"belirgin vurgu yok" der ve sakin dönem cümlesiyle başlar', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const money = areas.find((a) => a.key === 'money');
      expect(money?.subtitle).toBe('Belirgin vurgu yok');
      expect(money?.text.startsWith(EMPTY_AREA_TEXTS['money'])).toBe(true);
    });

    it('alanın her evi için kuşak burcu cümlesi ekler', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const money = areas.find((a) => a.key === 'money');
      expect(money?.text).toContain('Kazanç evin Koç burcunda başlıyor');
      expect(money?.text).toContain('Ortak kaynaklar evin Koç burcunda başlıyor');
      expect(money?.text).toContain(SIGN_STYLES['aries']);
    });

    it('yılın en vurgulu alanına yönlendirir', () => {
      const loveTitle = YEAR_AREAS.find((a) => a.key === 'love')?.title ?? '';
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const money = areas.find((a) => a.key === 'money');
      expect(money?.text).toContain(`Bu yıl enerjin daha çok ${loveTitle} alanında yoğunlaşıyor.`);
    });

    it('dolu alanda yönlendirme ve kuşak cümlesi yoktur', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)]));
      const love = areas.find((a) => a.key === 'love');
      expect(love?.text).not.toContain('enerjin daha çok');
      expect(love?.text).not.toContain('evin Koç burcunda başlıyor');
    });

    it('ev kuşakları yoksa kuşak cümlesi atlanır', () => {
      const areas = service.areas(chartOf([planet('venus', 'Venüs', 7)], [], []));
      const money = areas.find((a) => a.key === 'money');
      expect(money?.text).not.toContain('başlıyor');
      expect(money?.text.startsWith(EMPTY_AREA_TEXTS['money'])).toBe(true);
    });
  });
});