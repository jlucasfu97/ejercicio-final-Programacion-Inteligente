import { InjectionToken } from '@angular/core';

/**
 * Base URL of the AstroBookings backend (activity-bookings-express).
 * Override it in app.config.ts if the API runs elsewhere.
 */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:3000',
});
