import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Interpretation } from '../../core/models/interpretation';
import { InterpretationPanel } from './interpretation-panel';

const SAMPLE: Interpretation = {
  id: 'house-1',
  title: '1. Ev · Benlik',
  keywords: 'Benlik · Kendini ifade etme',
  position: "29°39' İkizler",
  description: '1. ev; kişinin kendini ifade etme biçimiyle ilişkilendirilir.',
  heading: "İkizler'de 1. Ev",
  text: 'İkizler etkisi bu alanda merak temalarını öne çıkarabilir.',
  source: 'static',
};

describe('InterpretationPanel', () => {
  let fixture: ComponentFixture<InterpretationPanel>;
  let closedCount: number;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [InterpretationPanel] }).compileComponents();

    fixture = TestBed.createComponent(InterpretationPanel);
    fixture.componentRef.setInput('interpretation', SAMPLE);
    closedCount = 0;
    fixture.componentInstance.closed.subscribe(() => closedCount++);
    await fixture.whenStable();
  });

  it('başlığı, konumu ve açıklamayı göstermeli', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('1. Ev · Benlik');
    expect(text).toContain("29°39' İkizler");
    expect(text).toContain("İkizler'de 1. Ev");
    expect(text).toContain('Astrolojik geleneğe dayanan');
  });

  it('✕ düğmesine basınca kapanma olayı gönderilmeli', () => {
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.close')!;
    button.click();

    expect(closedCount).toBe(1);
  });

  it('Esc tuşuna basınca kapanma olayı gönderilmeli', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(closedCount).toBe(1);
  });
});