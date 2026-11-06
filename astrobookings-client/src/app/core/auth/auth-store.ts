import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '../api';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models';

interface Session {
  token: string;
  user: AuthUser;
}

export const SESSION_STORAGE_KEY = 'astrobookings.session';

/** Reads the `exp` claim (seconds) of a JWT without verifying it */
function tokenExpiresAt(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt === null || expiresAt <= Date.now();
}

function readStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as Session;
    if (!session?.token || !session.user || isExpired(session.token)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function writeStoredSession(session: Session | null): void {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode...): the session just won't survive a reload
  }
}

/**
 * Holds the authenticated session (JWT + public user data) as signals
 * and persists it in localStorage.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly session = signal<Session | null>(readStoredSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  /** Backend id format (`user-<n>`), used to compare with `activity.userId` */
  readonly userId = computed(() => {
    const user = this.user();
    return user ? `user-${user.id}` : null;
  });

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(map((response) => this.start(response)));
  }

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users`, data)
      .pipe(map((response) => this.start(response)));
  }

  logout(): void {
    this.session.set(null);
    writeStoredSession(null);
  }

  private start(response: AuthResponse): AuthUser {
    const session: Session = { token: response.accessToken, user: response.user };
    this.session.set(session);
    writeStoredSession(session);
    return response.user;
  }
}
