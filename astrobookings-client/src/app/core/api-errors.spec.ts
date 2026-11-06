import { HttpErrorResponse } from '@angular/common/http';
import { toUiError } from './api-errors';

function apiError(status: number, message: string, errors: { field: string; message: string }[] = []) {
  return new HttpErrorResponse({ status, error: { message, errors } });
}

describe('toUiError', () => {
  it('explains that the backend is unreachable on status 0', () => {
    const ui = toUiError(new HttpErrorResponse({ status: 0 }));
    expect(ui.message).toContain('No se puede conectar con el servidor');
  });

  it('translates capacity errors with the remaining seats', () => {
    expect(toUiError(apiError(400, 'Capacity exceeded. Available: 2, Requested: 5')).message).toBe(
      'No hay plazas suficientes. Quedan 2 plazas libres.'
    );
    expect(toUiError(apiError(400, 'Capacity exceeded. Available: 1, Requested: 3')).message).toBe(
      'No hay plazas suficientes. Quedan 1 plaza libre.'
    );
    expect(toUiError(apiError(400, 'Capacity exceeded. Available: 0, Requested: 1')).message).toBe(
      'La actividad está completa.'
    );
  });

  it('translates "not open for bookings" reasons', () => {
    expect(toUiError(apiError(400, 'Activity is not open for bookings (status: draft)')).message).toBe(
      'Esta actividad no admite reservas (borrador).'
    );
    expect(
      toUiError(apiError(400, 'Activity is not open for bookings (you cannot book your own activity)')).message
    ).toBe('No puedes reservar tu propia actividad.');
    expect(toUiError(apiError(400, 'Activity is not open for bookings (date already passed)')).message).toBe(
      'Esta actividad ya se ha realizado.'
    );
  });

  it('translates payment and login errors', () => {
    expect(toUiError(apiError(402, 'Payment could not be processed')).message).toContain('pago ha sido rechazado');
    expect(toUiError(apiError(401, 'Invalid email or password')).message).toBe('Email o contraseña incorrectos.');
  });

  it('maps field errors by field name, translating known messages', () => {
    const ui = toUiError(
      apiError(400, 'Email is already registered', [
        { field: 'email', message: 'Email is already registered' },
        { field: 'username', message: 'Something else' },
      ])
    );
    expect(ui.fields).toEqual({ email: 'Este email ya está registrado', username: 'Something else' });
  });

  it('uses a generic message for server errors and unknown values', () => {
    expect(toUiError(apiError(500, 'boom')).message).toBe('Error del servidor. Inténtalo de nuevo más tarde.');
    expect(toUiError(new Error('x')).message).toBe('Ha ocurrido un error inesperado.');
  });
});
