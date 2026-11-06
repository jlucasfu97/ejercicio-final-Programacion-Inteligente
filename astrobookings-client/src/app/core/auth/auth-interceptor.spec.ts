import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore, SESSION_STORAGE_KEY } from './auth-store';
import { authInterceptor } from './auth-interceptor';
import { fakeToken } from './testing';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let token: string;

  beforeEach(() => {
    localStorage.clear();
    token = fakeToken(60_000);
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ token, user: { id: 7, username: 'Ana', email: 'a@b.c', terms: true } })
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('adds the Bearer token to API requests', () => {
    http.get('http://localhost:3000/bookings').subscribe();
    const req = backend.expectOne('http://localhost:3000/bookings');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush([]);
  });

  it('does not leak the token to other hosts', () => {
    http.get('https://example.com/data').subscribe();
    const req = backend.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('on 401 closes the session and redirects to login', async () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const result = firstValueFrom(http.get('http://localhost:3000/bookings'));

    backend
      .expectOne('http://localhost:3000/bookings')
      .flush({ message: 'Invalid or expired token', errors: [] }, { status: 401, statusText: 'Unauthorized' });

    await expect(result).rejects.toMatchObject({ status: 401 });
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login'], expect.objectContaining({ queryParams: expect.objectContaining({ expired: 1 }) }));
  });
});
