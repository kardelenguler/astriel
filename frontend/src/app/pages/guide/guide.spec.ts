import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { GUIDE_FACTS } from '../../core/content/guides/guide-facts';
import { HOUSE_GUIDES } from '../../core/content/guides/house-guides';
import { SIGN_GUIDES } from '../../core/content/guides/sign-guides';
import { DescriptionService } from '../../core/services/description.service';
import { NotFound } from '../not-found/not-found';
import { GuideHub } from './guide-hub/guide-hub';
import { guideRoutes } from './guide.routes';

describe('Rehber sayfaları', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'rehber', component: GuideHub },
          ...guideRoutes(HOUSE_GUIDES),
          ...guideRoutes(SIGN_GUIDES),
          { path: '**', component: NotFound },
        ]),
      ],
    });
    TestBed.inject(DescriptionService).init();
    harness = await RouterTestingHarness.create();
  });

  const page = () => harness.routeNativeElement!;
  const text = (selector: string) => page().querySelector(selector)?.textContent?.trim();

  it('rehber ana sayfası 12 Burç ve 12 Ev kartlarını göstermeli', async () => {
    await harness.navigateByUrl('/rehber');

    const cards = page().querySelectorAll('.hub-card h2');
    expect(Array.from(cards, (card) => card.textContent?.trim())).toEqual([
      SIGN_GUIDES.title,
      HOUSE_GUIDES.title,
    ]);
  });

  it('liste sayfası 12 evi göstermeli', async () => {
    await harness.navigateByUrl('/evler');

    expect(page().querySelectorAll('.card').length).toBe(12);
  });

  it('ev sayfası başlığı, sekme adını ve Google açıklamasını göstermeli', async () => {
    await harness.navigateByUrl('/evler/7-ev');

    expect(text('h1')).toBe('7. Ev Nedir? İlişkiler, Ortaklıklar ve Evlilik');
    expect(TestBed.inject(Title).getTitle()).toBe(
      '7. Ev Nedir? İlişkiler, Ortaklıklar ve Evlilik · Astriel',
    );
    expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe(
      HOUSE_GUIDES.items[6].description,
    );
  });

  it('burç sayfasında bilgi kutusu görünmeli', async () => {
    await harness.navigateByUrl('/burclar/akrep');

    expect(text('.facts')).toContain('Su');
    expect(text('.facts')).toContain('Sabit');
    expect(text('.facts')).toContain('Plüton');
  });

  it('önceki ve sonraki sayfaya bağlantı vermeli', async () => {
    await harness.navigateByUrl('/evler/7-ev');

    expect(text('.prev')).toContain('6. Ev');
    expect(text('.next')).toContain('8. Ev');
  });

  it('ilk sayfada "önceki" bağlantısı olmamalı', async () => {
    await harness.navigateByUrl('/burclar/koc');

    expect(page().querySelector('.prev')).toBeNull();
    expect(text('.next')).toContain('Boğa');
  });

  it('başka bir eve geçince içerik güncellenmeli', async () => {
    await harness.navigateByUrl('/evler/1-ev');
    await harness.navigateByUrl('/evler/2-ev');

    expect(text('h1')).toContain('2. Ev');
  });

  it('olmayan bir adres "Sayfa bulunamadı"ya düşmeli', async () => {
    await harness.navigateByUrl('/evler/99-ev');

    expect(harness.routeDebugElement?.componentInstance).toBeInstanceOf(NotFound);
  });
});

describe('Rehber içerikleri', () => {
  for (const collection of [HOUSE_GUIDES, SIGN_GUIDES]) {
    it(`/${collection.path}: 12 sayfa, benzersiz adresler, kısa açıklamalar, bilgi kutusu`, () => {
      const slugs = collection.items.map((item) => item.slug);
      expect(slugs.length).toBe(12);
      expect(new Set(slugs).size).toBe(12);

      for (const item of collection.items) {
        expect(item.slug, item.slug).toMatch(/^[a-z0-9-]+$/); // adreste Türkçe karakter olmasın
        expect(item.description.length, item.slug).toBeLessThanOrEqual(160); // Google kesmesin
        expect(GUIDE_FACTS[item.slug], item.slug).toBeDefined(); // her sayfanın bilgi kutusu olsun
      }
    });
  }
});