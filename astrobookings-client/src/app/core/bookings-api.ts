import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Booking } from './models';

/** Write operations on bookings (reads use httpResource in the pages) */
@Injectable({ providedIn: 'root' })
export class BookingsApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  create(activityId: string, participants: number): Observable<Booking> {
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, { activityId, participants });
  }
}
