import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartResponse } from '../../core/models/chart';
import { mockChart, mockChartWithSpecialPoints } from '../../testing/mock-chart';
import { SpecialPoints } from './special-points';

// Hangi kartın üretileceği special-point-cards.spec.ts'te test edildi.
// Burada kartların ekranda doğru çizildiği test edilir.
describe('SpecialPoints', () => {
  let fixture: ComponentFixture<SpecialPoints>;

  async function render(chart: ChartResponse): Promise<HTMLElement> {
    fixture.componentRef.setInput('chart', chart);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpecialPoints] }).compileComponents();
    fixture = TestBed.createComponent(SpecialPoints);
  });

  it('doğum saati biliniyorsa 6 kartı burç ve ev bilgisiyle göstermeli', async () => {
    const el = await render(mockChartWithSpecialPoints());

    const cards = el.querySelectorAll('article.card');
    expect(cards).toHaveLength(6);
    expect(el.querySelectorAll('article.card.locked')).toHaveLength(0);

    // Örnek haritada hepsi Kova burcunda ve 5. evde
    const first = cards[0].textContent ?? '';
    expect(first).toContain('Kuzey Düğüm');
    expect(first).toContain('Kova · 5. Ev');
  });

  it('doğum saati yoksa Şans Noktası kilitli görünmeli, kartlarda ev yazmamalı', async () => {
    const el = await render(mockChartWithSpecialPoints({ timeKnown: false }));

    const locked = el.querySelectorAll('article.card.locked');
    expect(locked).toHaveLength(1);
    expect(locked[0].textContent).toContain('Şans Noktası');
    expect(locked[0].textContent).toContain('Doğum saati gerekli');

    // Başlık altındaki konum satırında sadece burç olmalı ("Kova · 5. Ev" değil)
    const places = Array.from(el.querySelectorAll('.where'), (p) => p.textContent?.trim());
    expect(places.filter((p) => p === 'Kova')).toHaveLength(5);
  });

  it('hiç özel nokta yoksa bölüm hiç görünmemeli', async () => {
    // Örnek haritada özel nokta yok; doğum saati bilindiği için kilitli kart da çıkmaz
    const el = await render(mockChart());

    expect(el.querySelector('section')).toBeNull();
  });
});