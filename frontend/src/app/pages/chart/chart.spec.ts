import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Chart } from './chart';

describe('Chart', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chart],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('oluşturulabilmeli', () => {
    const fixture = TestBed.createComponent(Chart);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('adreste doğum bilgisi yoksa nazik bir hata mesajı göstermeli', async () => {
    const fixture = TestBed.createComponent(Chart);
    await fixture.whenStable();

    expect(fixture.componentInstance.error()).toContain('eksik veya hatalı');
  });
}); 