import { ComponentFixture, TestBed } from '@angular/core/testing';

import { mockChart } from '../../testing/mock-chart';
import { ChartWheel } from './chart-wheel';

describe('ChartWheel', () => {
  async function render(timeKnown = true): Promise<ComponentFixture<ChartWheel>> {
    const fixture = TestBed.createComponent(ChartWheel);
    fixture.componentRef.setInput('chart', mockChart({ timeKnown }));
    await fixture.whenStable();
    return fixture;
  }

  /** Bir gezegen sembolünün SVG içindeki konumu */
  function glyphPosition(element: HTMLElement, planetName: string): { x: number; y: number } {
    const group = Array.from(element.querySelectorAll('g.planet')).find((g) =>
      g.querySelector('title')?.textContent?.startsWith(planetName),
    );
    const text = group!.querySelector('text.planet-glyph')!;
    return { x: Number(text.getAttribute('x')), y: Number(text.getAttribute('y')) };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ChartWheel] }).compileComponents();
  });

  it('oluşturulabilmeli', async () => {
    const fixture = await render();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('saat biliniyorsa 12 ev numarası ve ASC/MC etiketleri çizilmeli', async () => {
    const element: HTMLElement = (await render()).nativeElement;

    expect(element.querySelectorAll('.house-no').length).toBe(12);
    const labels = Array.from(element.querySelectorAll('.axis-label')).map((l) => l.textContent);
    expect(labels).toEqual(['ASC', 'MC']);
  });

  it('yükselen çarkın sol tarafında olmalı', async () => {
    const element: HTMLElement = (await render()).nativeElement;
    const asc = Array.from(element.querySelectorAll('.axis-label')).find((l) => l.textContent === 'ASC')!;

    // Merkez x=250; sol taraf, merkezden çok daha küçük bir x değeri demek
    expect(Number(asc.getAttribute('x'))).toBeLessThan(50);
  });

  it('saat bilinmiyorsa evler ve ASC/MC çizilmemeli', async () => {
    const element: HTMLElement = (await render(false)).nativeElement;

    expect(element.querySelectorAll('.house-no').length).toBe(0);
    expect(element.querySelectorAll('.axis-label').length).toBe(0);
    expect(element.querySelectorAll('g.planet').length).toBe(6); // gezegenler yine görünür
  });

  it('kavuşumlar çizilmemeli; uyumlu ve zorlayıcı açılar ayrı renkte olmalı', async () => {
    const element: HTMLElement = (await render()).nativeElement;

    expect(element.querySelectorAll('line.aspect').length).toBe(2);
    expect(element.querySelectorAll('line.aspect.harmonious').length).toBe(1);
    expect(element.querySelectorAll('line.aspect.hard').length).toBe(1);
  });

  it('birbirine çok yakın gezegenlerin sembolleri üst üste binmemeli', async () => {
    const element: HTMLElement = (await render()).nativeElement;
    const mercury = glyphPosition(element, 'Merkür');
    const venus = glyphPosition(element, 'Venüs');
    const distance = Math.hypot(mercury.x - venus.x, mercury.y - venus.y);

    expect(distance).toBeGreaterThan(20); // semboller yaklaşık 19px boyutunda
    expect(element.querySelectorAll('line.connector').length).toBeGreaterThan(0);
  });
});