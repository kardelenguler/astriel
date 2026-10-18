import { TestBed } from '@angular/core/testing';

import { ChartResponse } from '../../core/models/chart';
import { SolarReturnYear } from './solar-return-year';

describe('SolarReturnYear', () => {
  function create() {
    const fixture = TestBed.createComponent(SolarReturnYear);
    fixture.componentRef.setInput('chart', {
      planets: [],
      aspects: [],
      ascendant: null,
    } as unknown as ChartResponse);
    fixture.componentRef.setInput('only', 'areas');
    fixture.detectChanges();
    return fixture;
  }

  it('gezegen yoksa kart listesi boş', () => {
    expect(create().componentInstance.areas()).toEqual([]);
  });

  it('gezegen yoksa bilgi mesajı gösterir', () => {
    const el: HTMLElement = create().nativeElement;
    expect(el.textContent).toContain('yorumu hazırlanamadı');
  });

  it('tema yoksa hiçbir şey çizmez', () => {
    const fixture = create();
    fixture.componentRef.setInput('only', 'theme');
    fixture.detectChanges();
    expect(fixture.componentInstance.theme()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('.theme')).toBeNull();
  });
});