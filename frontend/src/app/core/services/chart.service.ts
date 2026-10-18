import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChartCalculateRequest, ChartResponse } from '../models/chart';
import { SolarReturnRequest, SolarReturnResponse } from '../models/solar-return';

/**
 * Harita hesaplama (backend: POST /charts/calculate ve /charts/solar-return).
 * Sadece kaydetmeden hesaplama; kayıtlı haritalar için SavedChartsService kullanılır.
 */
@Injectable({ providedIn: 'root' })
export class ChartService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/charts`;

  /** Haritayı hesaplar, kaydetmez (misafir de kullanabilir, giriş gerekmez) */
  calculate(request: ChartCalculateRequest): Observable<ChartResponse> {
    return this.http.post<ChartResponse>(`${this.url}/calculate`, request);
  }

  /** Verilen yılın Solar Return haritasını hesaplar, kaydetmez */
  solarReturn(request: SolarReturnRequest): Observable<SolarReturnResponse> {
    return this.http.post<SolarReturnResponse>(`${this.url}/solar-return`, request);
  }
}