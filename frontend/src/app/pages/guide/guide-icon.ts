import { Component, computed, input } from '@angular/core';

/** Rehber sayfalarındaki ince çizgili ikonlar (24x24, renk: currentColor) */
const ICONS = {
  calendar:
    'M6 5h12a2.5 2.5 0 0 1 2.5 2.5v10A2.5 2.5 0 0 1 18 20H6a2.5 2.5 0 0 1-2.5-2.5v-10A2.5 2.5 0 0 1 6 5ZM3.5 10h17M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01',
  // elementler
  fire: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1 2.6 2 3 0-3-.5-5.5.5-8Z',
  earth: 'M5 19c0-8 6-14 15-14 0 9-6 15-14 15M5 19l9-9',
  air: 'M3 9h11a3 3 0 1 0-3-3M3 13h15a3 3 0 1 1-3 3M3 17h7',
  water: 'M12 3c3 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-6.5 6-11Z',
  // nitelikler
  cardinal: 'M6 18 18 6M9 6h9v9',
  fixed: 'M12 3 21 12 12 21 3 12ZM12 9v6M9 12h6',
  mutable: 'M7.5 9.5c-3 0-3 5 0 5 2.5 0 6.5-5 9-5 3 0 3 5 0 5-2.5 0-6.5-5-9-5Z',
  // haritada
  sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z',
  rising: 'M12 20V5M6 11l6-6 6 6',
  house: 'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  // güçlü yönler / dikkat edilmesi gerekenler
  cloud: 'M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z',
  leaf: 'M6 18c0-6 4.5-11 12-11 0 7-5 11.5-11 11.5M6 18l6-6',
  // ev sayfaları
  layers: 'M12 4 3 8.5l9 4.5 9-4.5L12 4ZM3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5',
  angle: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3 12h18M12 3v18',
  opposite: 'M4 9h15l-3.5-3.5M20 15H5l3.5 3.5',
  planet:
    'M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0ZM6.5 14C3.5 16 2.5 17.8 3.4 18.6c1.3 1.1 6-.6 10.6-3.7S21.9 8.3 20.6 7.2c-.8-.7-2.6-.3-5 .9',
  spark: 'M12 4c.6 4.2 3.8 7.4 8 8-4.2.6-7.4 3.8-8 8-.6-4.2-3.8-7.4-8-8 4.2-.6 7.4-3.8 8-8Z',
  arrowLeft: 'M15 6l-6 6 6 6',
  arrowRight: 'M9 6l6 6-6 6',
} as const;

export type GuideIconName = keyof typeof ICONS;

@Component({
  selector: 'app-guide-icon',
  template: `<svg viewBox="0 0 24 24" aria-hidden="true"><path [attr.d]="path()" /></svg>`,
  styles: `
    :host {
      display: inline-flex;
      width: 22px;
      height: 22px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
  `,
})
export class GuideIcon {
  readonly name = input.required<GuideIconName>();
  protected readonly path = computed(() => ICONS[this.name()]);
}