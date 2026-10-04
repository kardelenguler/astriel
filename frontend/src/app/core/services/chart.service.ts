import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChartCalculateRequest, ChartResponse } from '../models/chart';

/**
 * Doğum haritası hesaplama (backend: POST /charts/calculate).
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
}
