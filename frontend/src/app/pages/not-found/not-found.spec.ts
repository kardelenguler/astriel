import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('oluşturulabilmeli', () => {
    const fixture = TestBed.createComponent(NotFound);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('açıkken Google için noindex eklemeli, kapanınca kaldırmalı', () => {
    const meta = TestBed.inject(Meta);
    const fixture = TestBed.createComponent(NotFound);

    expect(meta.getTag('name="robots"')?.content).toBe('noindex');

    fixture.destroy();
    expect(meta.getTag('name="robots"')).toBeNull();
  });
});