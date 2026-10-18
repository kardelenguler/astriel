import { TestBed } from '@angular/core/testing';

import { ChartResponse } from '../../core/models/chart';
import { ChartWheel } from './chart-wheel';

/** Sadece çarkın okuduğu alanları dolduran küçük örnek harita */
function chartWith(longitudes: Record<string, number>): ChartResponse {
  return {
    planets: Object.entries(longitudes).map(([key, longitude]) => ({
      key,
      name: key,
      longitude,
      sign: { key: 'aries', name: 'Koç', element: 'fire', modality: 'cardinal' },
      degree: longitude % 30,
      formatted: `${longitude}°`,
      speed: 1,
      retrograde: false,
      house: null,
    })),
    houses: [],
    ascendant: null,
    midheaven: null,
    aspects: [],
    warnings: [],
    special_points: [],
  } as unknown as ChartResponse;
}

describe('ChartWheel dış halka', () => {
  function create(outer: ChartResponse | null) {
    const fixture = TestBed.createComponent(ChartWheel);
    fixture.componentRef.setInput('chart', chartWith({ sun: 10, moon: 100 }));
    fixture.componentRef.setInput('outer', outer);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('dış harita verilmezse dış halka çizilmemeli ve alan genişlememeli', () => {
    const element = create(null);

    expect(element.querySelectorAll('.outer-planet')).toHaveLength(0);
    expect(element.querySelector('svg')?.getAttribute('viewBox')).toBe('-30 -30 560 560');
  });

  it('dış harita verilirse her gezegeni dış halkada çizmeli ve alanı genişletmeli', () => {
    const element = create(chartWith({ sun: 40, moon: 200, mars: 300 }));

    expect(element.querySelectorAll('.outer-planet')).toHaveLength(3);
    expect(element.querySelector('svg')?.getAttribute('viewBox')).toBe('-70 -70 640 640');
  });

  it('dış halka gezegenlerinin ipucu yazısı "İlerletilmiş" ile başlamalı', () => {
    const element = create(chartWith({ sun: 40 }));

    expect(element.querySelector('.outer-planet title')?.textContent).toContain('İlerletilmiş sun');
  });
});