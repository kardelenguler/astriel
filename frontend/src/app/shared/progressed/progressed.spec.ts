import { TestBed } from '@angular/core/testing';
import { NEVER } from 'rxjs';

import { PROGRESS_MOON_TEXTS } from '../../core/content/progress-texts/cards';
import { ChartResponse } from '../../core/models/chart';
import { ProgressedResponse } from '../../core/models/progressed';
import { ChartService } from '../../core/services/chart.service';
import { Progressed } from './progressed';

function sign(key: string, name: string) {
  return { key, name };
}

function planet(key: string, name: string, signKey: string, signName: string, house: number) {
  return {
    key,
    name,
    sign: sign(signKey, signName),
    formatted: `10°00' ${signName}`,
    house,
    retrograde: false,
  };
}

function progressedResponse(houses: unknown[] = [{}, {}]): ProgressedResponse {
  const chart = {
    planets: [
      {
        key: 'moon',
        name: 'Ay',
        sign: sign('libra', 'Terazi'),
        formatted: "14°32' Terazi",
        house: 3,
        retrograde: false,
      },
      {
        key: 'sun',
        name: 'Güneş',
        sign: sign('aquarius', 'Kova'),
        formatted: "6°48' Kova",
        house: 4,
        retrograde: false,
      },
      planet('venus', 'Venüs', 'sagittarius', 'Yay', 3),
      planet('chiron', 'Kiron', 'aries', 'Koç', 9),
    ],
    ascendant: { sign: sign('sagittarius', 'Yay'), formatted: "18°21' Yay" },
    houses,
    house_system: { code: 'P', name: 'Placidus' },
    aspects: [
      { first: 'sun', second: 'moon', type: { key: 'trine', name: 'Üçgen' }, orb: 3 },
      { first: 'venus', second: 'sun', type: { key: 'square', name: 'Kare' }, orb: 1 },
      { first: 'moon', second: 'venus', type: { key: 'sextile', name: 'Altmışlık' }, orb: 2 },
    ],
    warnings: [],
  } as unknown as ChartResponse;

  return {
    target_date: '2027-01-26',
    age_years: 22,
    chart,
    next_moon_sign_change: { change_date: '2029-10-12', sign: sign('scorpio', 'Akrep') },
  } as unknown as ProgressedResponse;
}

describe('Progressed', () => {
  function create() {
    TestBed.configureTestingModule({
      providers: [{ provide: ChartService, useValue: { progressed: () => NEVER } }],
    });
    const fixture = TestBed.createComponent(Progressed);
    fixture.componentRef.setInput('request', {
      birth_date: '2005-01-26',
      birth_time: '14:15',
      latitude: 37.7,
      longitude: 30.5,
    });
    fixture.componentRef.setInput('natal', { planets: [], ascendant: null } as unknown as ChartResponse);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  describe('zaman seçici', () => {
    it('yaş seçilince doğum günü tarihine çevrilir', () => {
      const c = create();
      c.setAge(22);
      expect(c.targetDate()).toBe('2027-01-26');
      expect(c.age()).toBe(22);
      expect(c.dateText()).toBe('26 Ocak 2027');
    });

    it('yaş 1 ile en büyük yaş arasında kalır', () => {
      const c = create();
      c.setAge(0);
      expect(c.sliderAge()).toBe(1);
      c.setAge(500);
      expect(c.sliderAge()).toBe(c.maxAge());
    });

    it('−/+ düğmeleri yaşı bir değiştirir', () => {
      const c = create();
      c.setAge(22);
      c.shiftAge(1);
      expect(c.age()).toBe(23);
      c.shiftAge(-2);
      expect(c.age()).toBe(21);
    });

    it('tarih seçilince yaş tamamlanmış yıl olarak hesaplanır', () => {
      const c = create();
      c.setDate('2027-01-25');
      expect(c.age()).toBe(21);
      c.setDate('2027-01-26');
      expect(c.age()).toBe(22);
    });

    it('doğumdan önceki tarih hata verir', () => {
      const c = create();
      c.setDate('2005-01-26');
      expect(c.dateError()).toBe('Tarih doğum tarihinden sonra olmalı.');
      expect(c.dateText()).toBe('');
    });

    it('geçersiz tarihte yaş null olur', () => {
      const c = create();
      c.setDate('');
      expect(c.age()).toBeNull();
      expect(c.dateError()).toBe('Bir tarih seç.');
    });

    it('yaş seç / tarih seç arasında geçilir', () => {
      const c = create();
      expect(c.pickMode()).toBe('age');
      c.setPickMode('date');
      expect(c.pickMode()).toBe('date');
    });
  });

  describe('üst kartlar', () => {
    it('Ay, Güneş ve Yükselen için üretilir', () => {
      const c = create();
      c.result.set(progressedResponse());
      const cards = c.cards();
      expect(cards.map((x) => x.key)).toEqual(['moon', 'sun', 'asc']);
      expect(cards[0].label).toBe('Progress Ay');
      expect(cards[0].sign).toBe('Terazi');
      expect(cards[0].house).toBe(3);
      expect(cards[0].teaser).toBe(PROGRESS_MOON_TEXTS['libra']);
      expect(cards[2].house).toBe(1);
    });

    it('doğum saati yoksa Yükselen kartı çıkmaz', () => {
      const c = create();
      const response = progressedResponse();
      (response.chart as unknown as { ascendant: null }).ascendant = null;
      c.result.set(response);
      expect(c.cards().map((x) => x.key)).toEqual(['moon', 'sun']);
    });
  });

  describe('alt sekmeler', () => {
    it('başlangıçta Genel Bakış açıktır', () => {
      expect(create().subTab()).toBe('overview');
    });

    it('evler varsa Evler sekmesi seçilebilir', () => {
      const c = create();
      c.result.set(progressedResponse());
      c.setSubTab('houses');
      expect(c.hasHouses()).toBe(true);
      expect(c.subTab()).toBe('houses');
    });

    it('ev yoksa Evler seçili olsa da Genel Bakış gösterilir', () => {
      const c = create();
      c.result.set(progressedResponse([]));
      c.setSubTab('houses');
      expect(c.hasHouses()).toBe(false);
      expect(c.subTab()).toBe('overview');
    });
  });

  describe('seçili gezegen', () => {
    it('varsayılan olarak Güneş seçilidir', () => {
      const c = create();
      c.result.set(progressedResponse());
      expect(c.selectedPlanet()?.key).toBe('sun');
    });

    it('selectPlanet seçimi değiştirir', () => {
      const c = create();
      c.result.set(progressedResponse());
      c.selectPlanet('moon');
      expect(c.selectedPlanet()?.key).toBe('moon');
    });

    it('açılar orb değerine göre küçükten büyüğe sıralanır', () => {
      const c = create();
      c.result.set(progressedResponse());
      const aspects = c.planetAspects();
      expect(aspects.map((a) => a.other)).toEqual(['Venüs', 'Ay']);
      expect(aspects[0].kind).toBe('hard');
      expect(aspects[1].kind).toBe('harmonious');
      expect(aspects[0].orb).toBe('1.0');
    });
  });

  describe('gezegen listesi ve bilgiler', () => {
    it('listede sadece ana gezegenler yer alır', () => {
      const c = create();
      c.result.set(progressedResponse());
      const keys = c.planetList().map((p) => p.key);
      expect(keys).toEqual(['sun', 'moon', 'venus']);
      expect(c.planetList()[0].glyph).toContain('☉');
    });

    it('bilgi satırları yaş, tarih ve progress zamanını içerir', () => {
      const c = create();
      c.setDate('2027-01-26');
      c.result.set(progressedResponse());
      const rows = Object.fromEntries(c.infoRows().map((r) => [r.label, r.value]));
      expect(rows['Doğum tarihi']).toBe('26 Ocak 2005');
      expect(rows['Doğum saati']).toBe('14:15');
      expect(rows['Seçilen yaş']).toBe('22');
      expect(rows['Karşılık gelen tarih']).toBe('26 Ocak 2027');
      expect(rows['Progress zamanı']).toBe('17 Şubat 2005');
      expect(rows['Ev sistemi']).toBe('Placidus');
    });

    it('Progress Ay bir sonraki burç değişimini gösterir', () => {
      const c = create();
      c.result.set(progressedResponse());
      expect(c.moonInfo()).toEqual({ current: 'Terazi', next: 'Akrep', date: '12 Ekim 2029' });
    });
  });
});