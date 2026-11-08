import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ChartCalculateRequest } from '../models/chart';
import { mockChart } from '../../testing/mock-chart';
import { ChartService } from './chart.service';

const CHARTS_URL = `${environment.apiUrl}/charts`;

const BIRTH: ChartCalculateRequest = {
  birth_date: '2005-01-26',
  birth_time: '14:15',
  latitude: 36.8865728,
  longitude: 30.7030242,
};

describe('ChartService', () => {
  let service: ChartService;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChartService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify()); // beklenmeyen istek kalmasın

  it('doğum haritasını /charts/calculate adresine POST ile göndermeli', () => {
    let utc = '';
    service.calculate(BIRTH).subscribe((chart) => (utc = chart.utc_datetime));

    const req = backend.expectOne(`${CHARTS_URL}/calculate`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(BIRTH);
    req.flush(mockChart());

    expect(utc).toBe('2005-01-26T12:15:00Z');
  });

  it('doğum saati bilinmiyorsa birth_time null olarak gitmeli', () => {
    service.calculate({ ...BIRTH, birth_time: null }).subscribe();

    const req = backend.expectOne(`${CHARTS_URL}/calculate`);
    expect(req.request.body.birth_time).toBeNull();
    req.flush(mockChart({ timeKnown: false }));
  });

  it('Solar Return isteğini yıl ve bulunulan yerle birlikte göndermeli', () => {
    const request = { ...BIRTH, year: 2026, return_latitude: 41.0082, return_longitude: 28.9784 };
    service.solarReturn(request).subscribe();

    const req = backend.expectOne(`${CHARTS_URL}/solar-return`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({ year: 2026, used_birth_place: false, chart: mockChart() });
  });

  it('ilerletilmiş harita isteğini hedef tarihle birlikte göndermeli', () => {
    const request = { ...BIRTH, target_date: '2026-11-08' };
    service.progressed(request).subscribe();

    const req = backend.expectOne(`${CHARTS_URL}/progressed`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush({});
  });

  it('sunucu hatasını sayfaya iletmeli', () => {
    let status = 0;
    service.calculate(BIRTH).subscribe({ error: (error) => (status = error.status) });

    backend
      .expectOne(`${CHARTS_URL}/calculate`)
      .flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(status).toBe(500); // sayfa "Harita hesaplanırken bir sorun oluştu" mesajını gösterir
  });
});