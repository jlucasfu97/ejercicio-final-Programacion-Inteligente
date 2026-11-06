import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth-guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'activities' },
  {
    path: 'login',
    title: 'Iniciar sesión · AstroBookings',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Crear cuenta · AstroBookings',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register').then((m) => m.Register),
  },
  {
    path: 'activities',
    title: 'Actividades · AstroBookings',
    loadComponent: () => import('./features/activities/activity-list').then((m) => m.ActivityList),
  },
  {
    path: 'activities/:id',
    title: 'Actividad · AstroBookings',
    loadComponent: () => import('./features/activities/activity-detail').then((m) => m.ActivityDetail),
  },
  {
    path: 'bookings',
    title: 'Mis reservas · AstroBookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/booking-list').then((m) => m.BookingList),
  },
  {
    path: 'bookings/:id',
    title: 'Reserva · AstroBookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/booking-detail').then((m) => m.BookingDetail),
  },
  { path: '**', redirectTo: 'activities' },
];
