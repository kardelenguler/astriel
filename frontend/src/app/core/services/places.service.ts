import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Place } from '../models/place';

/**
 * Doğum yeri araması (backend: GET /places/search).
 *
 * NOT: Sadece kullanıcı "Ara"ya bastığında çağrılmalı. Her tuşta çağırmak
 * (otomatik tamamlama) Nominatim kurallarına aykırı; backend'in IP'si engellenir.
 */
@Injectable({ providedIn: 'root' })
export class PlacesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/places/search`;

  search(query: string): Observable<Place[]> {
    return this.http.get<Place[]>(this.url, { params: { q: query } });
  }
} 