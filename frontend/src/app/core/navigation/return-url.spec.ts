import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { safeReturnUrl } from './return-url';

/** Sadece ?donus=... değerini taşıyan sahte bir ActivatedRoute */
function routeWith(donus: string | null): ActivatedRoute {
  const params = donus === null ? {} : { donus };
  return { snapshot: { queryParamMap: convertToParamMap(params) } } as unknown as ActivatedRoute;
}

describe('safeReturnUrl (giriş sonrası dönüş adresi)', () => {
  it('site içi adrese dönmeli', () => {
    expect(safeReturnUrl(routeWith('/haritalarim'))).toBe('/haritalarim');
    expect(safeReturnUrl(routeWith('/harita?tarih=2005-01-26'))).toBe('/harita?tarih=2005-01-26');
  });

  it('dönüş adresi yoksa ana sayfaya gitmeli', () => {
    expect(safeReturnUrl(routeWith(null))).toBe('/');
    expect(safeReturnUrl(routeWith(''))).toBe('/');
  });

  // Açık yönlendirme saldırısı: kullanıcıya "astriel.onrender.com/giris?donus=..." linki
  // gönderilir, giriş yapınca sahte bir siteye düşer. Bunların HİÇBİRİ çalışmamalı.
  it.each([
    ['https://kotu-site.com', 'tam adres'],
    ['//kotu-site.com', 'protokolsüz adres'],
    ['/\\kotu-site.com', 'ters eğik çizgili adres'],
    ['javascript:alert(1)', 'javascript adresi'],
    ['haritalarim', '/ ile başlamayan adres'],
  ])('%s (%s) yerine ana sayfaya gitmeli', (donus) => {
    expect(safeReturnUrl(routeWith(donus))).toBe('/');
  });
});