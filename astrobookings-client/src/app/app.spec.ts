import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { SESSION_STORAGE_KEY } from './core/auth/auth-store';
import { fakeToken } from './core/auth/testing';

describe('App', () => {
  async function render() {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => localStorage.clear());

  it('shows login and register links when logged out', async () => {
    const text = (await render()).querySelector('nav')?.textContent ?? '';
    expect(text).toContain('Entrar');
    expect(text).toContain('Registrarse');
    expect(text).not.toContain('Mis reservas');
  });

  it('shows the user name and private links when logged in', async () => {
    localStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify({ token: fakeToken(60_000), user: { id: 7, username: 'Ana', email: 'a@b.c', terms: true } })
    );
    const text = (await render()).querySelector('nav')?.textContent ?? '';
    expect(text).toContain('Ana');
    expect(text).toContain('Mis reservas');
    expect(text).toContain('Salir');
  });
});
