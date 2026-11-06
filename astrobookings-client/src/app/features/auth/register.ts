import { Component, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, email, form, minLength, required, validate } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { toUiError } from '../../core/api-errors';
import { AuthStore } from '../../core/auth/auth-store';
import { RegisterRequest } from '../../core/models';
import { FieldErrors } from '../../shared/field-errors';
import { safeReturnUrl } from './return-url';

@Component({
  selector: 'app-register',
  imports: [FormField, FormRoot, RouterLink, FieldErrors],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly serverError = signal<string | null>(null);
  protected readonly model = signal<RegisterRequest>({ username: '', email: '', password: '', terms: false });

  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.username, { message: 'Introduce tu nombre' });
      required(path.email, { message: 'Introduce tu email' });
      email(path.email, { message: 'Email no válido' });
      required(path.password, { message: 'Introduce una contraseña' });
      minLength(path.password, 6, { message: 'Mínimo 6 caracteres' });
      validate(path.terms, ({ value }) =>
        value() ? undefined : { kind: 'terms', message: 'Debes aceptar los términos' }
      );
    },
    {
      submission: {
        action: async (field) => {
          this.serverError.set(null);
          try {
            await firstValueFrom(this.auth.register(this.model()));
            await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()));
            return undefined;
          } catch (error) {
            const uiError = toUiError(error);
            // Field errors from the API are shown next to their input
            const fieldErrors = Object.entries(uiError.fields)
              .filter(([name]) => name in this.model())
              .map(([name, message]) => ({
                kind: 'server',
                message,
                fieldTree: field[name as keyof RegisterRequest],
              }));
            if (fieldErrors.length === 0) {
              this.serverError.set(uiError.message);
            }
            return fieldErrors;
          }
        },
      },
    }
  );
}
