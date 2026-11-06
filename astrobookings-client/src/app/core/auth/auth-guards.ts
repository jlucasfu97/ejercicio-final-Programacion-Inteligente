import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './auth-store';

/** Only for logged-in users; otherwise go to login and come back afterwards */
export const authGuard: CanActivateFn = (_route, state) =>
  inject(AuthStore).isAuthenticated()
    ? true
    : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });

/** Login / register pages make no sense with an active session */
export const guestGuard: CanActivateFn = () =>
  inject(AuthStore).isAuthenticated() ? inject(Router).createUrlTree(['/activities']) : true;
