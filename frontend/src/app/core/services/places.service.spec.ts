import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Place } from '../models/place';
import { PlacesService } from './places.service';

const SEARCH_URL = `${environment.apiUrl}/places/search`;

const ANTALYA: Place = {
  name: 'Antalya',
  display_name: 'Antalya, Akdeniz Bölgesi, Türkiye',
  latitude: 36.8865728,
  longitude: 30.7030242,
  country: 'Türkiye',
};

describe('PlacesService', () => {
  let service: PlacesService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PlacesService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify()); // beklenmeyen istek kalmasın

  it('aramayı ?q= parametresiyle GET isteği olarak göndermeli ve sonuçları döndürmeli', () => {
    let result: Place[] = [];
    service.search('Antalya').subscribe((places) => (result = places));

    const req = backend.expectOne((r) => r.url === SEARCH_URL);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('Antalya');
    req.flush([ANTALYA]);

    expect(result).toEqual([ANTALYA]);
  });

  it('Türkçe harfleri değiştirmeden göndermeli', () => {
    service.search('İzmir Bornova').subscribe();

    const req = backend.expectOne((r) => r.url === SEARCH_URL);
    expect(req.request.params.get('q')).toBe('İzmir Bornova');
    req.flush([]);
  });

  it('sunucu hatasını aramayı yapan sayfaya iletmeli', () => {
    let status = 0;
    service.search('Antalya').subscribe({ error: (error) => (status = error.status) });

    backend
      .expectOne((r) => r.url === SEARCH_URL)
      .flush(null, { status: 503, statusText: 'Service Unavailable' });

    expect(status).toBe(503); // sayfa "Dış servise ulaşılamıyor" mesajını gösterir
  });
});