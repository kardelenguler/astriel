import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(AnalyticsService);
  });

  it('doğum bilgilerini (adresteki ? kısmını) sayaca göndermemeli', () => {
    expect(service.toSafePath('/harita?tarih=2005-01-26&saat=14:15&enlem=36.8&boylam=30.7')).toBe(
      '/harita',
    );
  });

  it("kayıtlı haritanın id'sini sayaca göndermemeli", () => {
    expect(service.toSafePath('/harita/4816a7c6-99a7-4aea-94ea-770451234567')).toBe('/harita/kayitli');
  });

  it('diğer sayfaları olduğu gibi göndermeli', () => {
    expect(service.toSafePath('/hakkinda')).toBe('/hakkinda');
    expect(service.toSafePath('/')).toBe('/');
  });
}); 