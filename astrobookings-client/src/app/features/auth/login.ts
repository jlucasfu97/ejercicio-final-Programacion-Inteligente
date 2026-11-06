import { Component, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toUiError } from '../../core/api-errors';
import { AuthStore } from '../../core/auth/auth-store';
import { LoginRequest } from '../../core/models';
import { FieldErrors } from '../../shared/field-errors';
import { safeReturnUrl } from './return-url';

@Component({
  selector: 'app-login',
  imports: [FormField, FormRoot, RouterLink, FieldErrors],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  /** Query params, bound through withComponentInputBinding() */
  readonly returnUrl = input<string>();
  readonly expired = input<string>();

  protected readonly serverError = signal<string | null>(null);
  protected readonly model = signal<LoginRequest>({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Introduce tu email' });
      email(path.email, { message: 'Email no válido' });
      required(path.password, { message: 'Introduce tu contraseña' });
    },
    {
      submission: {
        action: async () => {
          this.serverError.set(null);
          try {
            await firstValueFrom(this.auth.login(this.model()));
            await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
          } catch (error) {
            this.serverError.set(toUiError(error).message);
          }
          return undefined;
        },
      },
    }
  );
}
