import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthResponse } from '../models';
import { AuthStore, SESSION_STORAGE_KEY } from './auth-store';
import { fakeToken } from './testing';

const response = (token = fakeToken(60_000)): AuthResponse => ({
  user: { id: 7, username: 'Ana', email: 'ana@example.com', terms: true },
  accessToken: token,
});

describe('AuthStore', () => {
  let http: HttpTestingController;

  function setup(): AuthStore {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    return TestBed.inject(AuthStore);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => http.verify());

  it('starts logged out', () => {
    const store = setup();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.user()).toBeNull();
  });

  it('login posts credentials, stores the session and exposes user signals', async () => {
    const store = setup();
    const result = firstValueFrom(store.login({ email: 'ana@example.com', password: 'secret1' }));

    const req = http.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ana@example.com', password: 'secret1' });
    req.flush(response());

    expect((await result).username).toBe('Ana');
    expect(store.isAuthenticated()).toBe(true);
    expect(store.userId()).toBe('user-7');
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)!).user.email).toBe('ana@example.com');
  });

  it('register posts to /users and opens a session', async () => {
    const store = setup();
    const result = firstValueFrom(
      store.register({ username: 'Ana', email: 'ana@example.com', password: 'secret1', terms: true })
    );
    const req = http.expectOne('http://localhost:3000/users');
    expect(req.request.body.terms).toBe(true);
    req.flush(response());
    await result;
    expect(store.isAuthenticated()).toBe(true);
  });

  it('logout clears memory and storage', async () => {
    const store = setup();
    const result = firstValueFrom(store.login({ email: 'a@b.c', password: 'x' }));
    http.expectOne('http://localhost:3000/login').flush(response());
    await result;

    store.logout();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });

  it('restores a valid stored session and discards an expired one', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: fakeToken(60_000), user: response().user }));
    expect(setup().isAuthenticated()).toBe(true);

    TestBed.resetTestingModule();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: fakeToken(-1_000), user: response().user }));
    expect(setup().isAuthenticated()).toBe(false);
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
  });
});
