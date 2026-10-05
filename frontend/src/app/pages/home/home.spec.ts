import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Place } from '../../core/models/place';
import { BirthForm } from '../../shared/birth-form/birth-form';
import { Home } from './home';

const ANTALYA = {
  name: 'Antalya',
  display_name: 'Antalya',
  latitude: 36.88,
  longitude: 30.7,
  country: 'Türkiye',
} as Place;

describe('Home', () => {
  let harness: RouterTestingHarness;
  let scrollCalls: unknown[]; // scrollIntoView her çağrıldığında buraya eklenir

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: Home }]),
        provideHttpClient(),
        provideHttpClientTesting(), // yer arama servisi gerçek istek atmasın
      ],
    });

    // Test ortamında (jsdom) scrollIntoView yok; sahtesini koyup çağrılıp çağrılmadığına bakıyoruz
    scrollCalls = [];
    Element.prototype.scrollIntoView = (options?: boolean | ScrollIntoViewOptions) => {
      scrollCalls.push(options);
    };
  });

  /** Ana sayfayı verilen adresle açar */
  async function open(url = '/'): Promise<void> {
    harness = await RouterTestingHarness.create(url);
  }

  /** Sayfadaki doğum formu component'i */
  function birthForm(): BirthForm {
    return harness.routeDebugElement!.query(By.directive(BirthForm)).componentInstance;
  }

  it('adreste bilgi yoksa form boş açılmalı ve sayfa kaymamalı', async () => {
    await open();

    expect(birthForm().initialValue()).toBeNull();
    expect(scrollCalls).toEqual([]);
  });

  it('"Bilgileri değiştir" ile gelindiyse formu doldurmalı ve forma kaymalı', async () => {
    await open('/?tarih=2005-01-26&saat=14:15&enlem=36.88&boylam=30.7&yer=Antalya');

    expect(birthForm().initialValue()).toEqual({
      birthDate: '2005-01-26',
      birthTime: '14:15',
      place: expect.objectContaining({ name: 'Antalya', latitude: 36.88, longitude: 30.7 }),
    });
    expect(scrollCalls.length).toBeGreaterThan(0);
  });

  it('saat yoksa formu "saat bilinmiyor" olarak doldurmalı', async () => {
    await open('/?tarih=2005-01-26&enlem=36.88&boylam=30.7&yer=Antalya');

    expect(birthForm().initialValue()?.birthTime).toBeNull();
  });

  it('adresteki bilgiler bozuksa formu boş açmalı', async () => {
    // enlem 90'dan büyük olamaz
    await open('/?tarih=2005-01-26&enlem=200&boylam=30.7&yer=Antalya');

    expect(birthForm().initialValue()).toBeNull();
  });

  it('form gönderilince bilgileri adrese koyup harita sayfasına gitmeli', async () => {
    await open();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    birthForm().submitted.emit({ birthDate: '2005-01-26', birthTime: '14:15', place: ANTALYA });

    expect(navigate).toHaveBeenCalledWith(['/harita'], {
      queryParams: {
        tarih: '2005-01-26',
        saat: '14:15',
        enlem: 36.88,
        boylam: 30.7,
        yer: 'Antalya',
      },
    });
  });

  it('saat bilinmiyorsa adrese saat eklememeli', async () => {
    await open();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    birthForm().submitted.emit({ birthDate: '2005-01-26', birthTime: null, place: ANTALYA });

    expect(navigate.mock.calls[0][1]?.queryParams?.['saat']).toBeUndefined();
  });

  it('alttaki "Ücretsiz Haritanı Oluştur" düğmesi forma kaydırmalı', async () => {
    await open();

    harness.routeNativeElement!.querySelector<HTMLButtonElement>('.cta-btn')!.click();

    expect(scrollCalls).toContainEqual({ behavior: 'smooth' });
  });
});