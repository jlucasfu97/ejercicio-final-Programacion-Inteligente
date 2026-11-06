import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api';
import { AuthStore } from './auth-store';

/**
 * Adds `Authorization: Bearer <token>` to backend requests.
 * If the backend rejects the token (401), the session is closed and the user is sent to login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const apiUrl = inject(API_URL);
  const token = auth.token();

  if (!token || !req.url.startsWith(apiUrl)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { returnUrl: router.url, expired: 1 } });
      }
      return throwError(() => error);
    })
  );
};
