import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ChartCreateRequest, ChartList, SavedChart } from '../models/saved-chart';

// Giriş gerektiren harita işlemleri. Token'ı interceptor otomatik ekliyor.
@Injectable({ providedIn: 'root' })
export class SavedChartsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/charts`;

  save(request: ChartCreateRequest): Observable<SavedChart> {
    return this.http.post<SavedChart>(this.baseUrl, request);
  }

  // Backend en fazla 50'ye izin veriyor
  list(limit = 50, offset = 0): Observable<ChartList> {
    return this.http.get<ChartList>(this.baseUrl, { params: { limit, offset } });
  }

  get(id: string): Observable<SavedChart> {
    return this.http.get<SavedChart>(`${this.baseUrl}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  restore(id: string): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/${id}/restore`, null);
  }
} 