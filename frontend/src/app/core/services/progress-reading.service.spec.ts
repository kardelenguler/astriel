import { TestBed } from '@angular/core/testing';

import {
  PROGRESS_MOON_TEXTS,
  PROGRESS_SUN_TEXTS,
} from '../content/progress-texts/cards';
import {
  PROGRESS_AREAS,
  PROGRESS_EMPTY_TEXTS,
  PROGRESS_HOUSE_THEMES,
  PROGRESS_PLANET_CLOSING,
  PROGRESS_PLANET_LINES,
} from '../content/progress-texts/readings';
import { ChartResponse } from '../models/chart';
import { ProgressReadingService } from './progress-reading.service';

interface SignLike {
  key: string;
  name: string;
}

const ARIES: SignLike = { key: 'aries', name: 'Koç' };
const LIBRA: SignLike = { key: 'libra', name: 'Terazi' };
const AQUARIUS: SignLike = { key: 'aquarius', name: 'Kova' };

function planet(
  key: string,
  name: string,
  house: number | null,
  sign: SignLike,
  retrograde = false,
) {
  return { key, name, house, sign, retrograde };
}

function cusps(sign: SignLike) {
  return Array.from({ length: 12 }, () => ({ sign }));
}

function chartOf(planets: ReturnType<typeof planet>[], houses: { sign: SignLike }[] = cusps(ARIES)) {
  return { planets, houses } as unknown as ChartResponse;
}

function areaOf(areas: ReturnType<ProgressReadingService['areas']>, key: string) {
  return areas.find((a) => a.key === key);
}

describe('ProgressReadingService', () => {
  let service: ProgressReadingService;

  beforeEach(() => {
    service = TestBed.inject(ProgressReadingService);
  });

  describe('Genel Tema', () => {
    it('Güneş evi, Güneş burcu ve Ay burcundan üretilir', () => {
      const chart = chartOf([planet('sun', 'Güneş', 4, AQUARIUS), planet('moon', 'Ay', 3, LIBRA)]);
      const theme = areaOf(service.areas(chart), 'theme');
      expect(theme?.subtitle).toBe('Güneş · 4. ev, Ay · 3. ev');
      expect(theme?.text).toContain(PROGRESS_HOUSE_THEMES[4]);
      expect(theme?.text).toContain(PROGRESS_SUN_TEXTS['aquarius']);
      expect(theme?.text).toContain(PROGRESS_MOON_TEXTS['libra']);
    });

    it('doğum saati yoksa sadece Genel Tema çıkar ve burçlarla anılır', () => {
      const chart = chartOf(
        [planet('sun', 'Güneş', null, AQUARIUS), planet('moon', 'Ay', null, LIBRA)],
        [],
      );
      const areas = service.areas(chart);
      expect(areas.map((a) => a.key)).toEqual(['theme']);
      expect(areas[0].subtitle).toBe('Güneş · Kova, Ay · Terazi');
      expect(areas[0].text).not.toContain(PROGRESS_HOUSE_THEMES[4]);
    });

    it('Güneş ve Ay yoksa kart çıkmaz', () => {
      expect(service.areas(chartOf([]))).toEqual([]);
    });
  });

  describe('alanlar', () => {
    it('evler biliniyorsa altı kart üretir', () => {
      const chart = chartOf([planet('sun', 'Güneş', 4, AQUARIUS), planet('moon', 'Ay', 7, LIBRA)]);
      expect(service.areas(chart).map((a) => a.key)).toEqual(PROGRESS_AREAS.map((a) => a.key));
    });

    it('dolu alan: ev teması, gezegen katkısı ve kapanış birleşir', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const love = areaOf(service.areas(chart), 'love');
      expect(love?.subtitle).toBe('Ay · 7. ev');
      expect(love?.text).toContain(PROGRESS_HOUSE_THEMES[7]);
      expect(love?.text).toContain(PROGRESS_PLANET_LINES['moon']);
      expect(love?.text).toContain(PROGRESS_PLANET_CLOSING['moon']);
    });

    it('ana gezegenin burcuna göre tarz cümlesi eklenir', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const love = areaOf(service.areas(chart), 'love');
      expect(love?.text).toContain('Progress Ay Terazi burcunda olduğu için');
    });

    it('ikinci gezegen "Ayrıca" ile eklenir', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA), planet('venus', 'Venüs', 5, ARIES)]);
      const love = areaOf(service.areas(chart), 'love');
      expect(love?.text).toContain('Ayrıca');
      expect(love?.text).toContain(PROGRESS_PLANET_LINES['venus']);
    });

    it('geri hareketteki gezegen için not ekler', () => {
      const chart = chartOf([planet('mars', 'Mars', 10, ARIES, true)]);
      const career = areaOf(service.areas(chart), 'career');
      expect(career?.text).toContain('Progress Mars geri hareket ediyor');
    });
  });

  describe('gezegeni olmayan alanlar', () => {
    it('sakin dönem cümlesiyle başlar ve "belirgin vurgu yok" der', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const money = areaOf(service.areas(chart), 'money');
      expect(money?.subtitle).toBe('Belirgin vurgu yok');
      expect(money?.text.startsWith(PROGRESS_EMPTY_TEXTS['money'])).toBe(true);
    });

    it('alanın evleri için kuşak burcu cümlesi ekler', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const money = areaOf(service.areas(chart), 'money');
      expect(money?.text).toContain('Kazanç evin Koç burcunda başlıyor');
      expect(money?.text).toContain('Ortak kaynaklar evin Koç burcunda başlıyor');
    });

    it('en vurgulu alana yönlendirir', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const money = areaOf(service.areas(chart), 'money');
      expect(money?.text).toContain('Bu dönemde enerjin daha çok Aşk ve İlişkiler alanında yoğunlaşıyor.');
    });

    it('dolu alanda yönlendirme yoktur', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)]);
      const love = areaOf(service.areas(chart), 'love');
      expect(love?.text).not.toContain('enerjin daha çok');
    });

    it('ev kuşakları yoksa kuşak cümlesi atlanır', () => {
      const chart = chartOf([planet('moon', 'Ay', 7, LIBRA)], []);
      const money = areaOf(service.areas(chart), 'money');
      expect(money?.text).not.toContain('başlıyor');
    });
  });
});