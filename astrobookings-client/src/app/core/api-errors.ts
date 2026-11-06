import { HttpErrorResponse } from '@angular/common/http';
import { activityStatusLabel } from './labels';
import { ApiErrorBody } from './models';

/** Error ready to show in the UI: a general message plus messages per form field */
export interface UiError {
  status: number;
  message: string;
  fields: Record<string, string>;
}

/** Known backend field messages -> Spanish */
const FIELD_MESSAGES: Record<string, string> = {
  'Email is already registered': 'Este email ya está registrado',
  'Email must be a valid email address': 'Email no válido',
  'Password is required and must be at least 6 characters long': 'Mínimo 6 caracteres',
  'Terms acceptance is required': 'Debes aceptar los términos',
};

/** Known backend general messages -> Spanish */
function translateMessage(status: number, message: string): string {
  const capacity = /^Capacity exceeded\. Available: (\d+)/.exec(message);
  if (capacity) {
    const available = Number(capacity[1]);
    return available === 0
      ? 'La actividad está completa.'
      : `No hay plazas suficientes. Quedan ${available} ${available === 1 ? 'plaza libre' : 'plazas libres'}.`;
  }

  const notOpen = /^Activity is not open for bookings \((.+)\)$/.exec(message);
  if (notOpen) {
    const reason = notOpen[1];
    if (reason.startsWith('status: ')) {
      return `Esta actividad no admite reservas (${activityStatusLabel(reason.slice(8)).toLowerCase()}).`;
    }
    if (reason.includes('own activity')) {
      return 'No puedes reservar tu propia actividad.';
    }
    if (reason.includes('date')) {
      return 'Esta actividad ya se ha realizado.';
    }
    return 'Esta actividad no admite reservas.';
  }

  switch (message) {
    case 'Invalid email or password':
      return 'Email o contraseña incorrectos.';
    case 'Payment could not be processed':
      return 'El pago ha sido rechazado. Prueba con otro número de plazas.';
    case 'Activity not found':
      return 'La actividad no existe.';
    case 'Booking not found':
      return 'La reserva no existe.';
    case 'Validation failed':
      return 'Revisa los datos del formulario.';
    case 'Email is already registered':
      return 'Este email ya está registrado.';
  }

  if (status === 401) {
    return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
  }
  if (status >= 500) {
    return 'Error del servidor. Inténtalo de nuevo más tarde.';
  }
  return message || 'Ha ocurrido un error inesperado.';
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return typeof body === 'object' && body !== null && typeof (body as ApiErrorBody).message === 'string';
}

/** Converts any error thrown by HttpClient / httpResource into a UiError */
export function toUiError(error: unknown): UiError {
  if (!(error instanceof HttpErrorResponse)) {
    return { status: -1, message: 'Ha ocurrido un error inesperado.', fields: {} };
  }

  if (error.status === 0) {
    return {
      status: 0,
      message: 'No se puede conectar con el servidor. Comprueba que el backend está arrancado.',
      fields: {},
    };
  }

  const body = isApiErrorBody(error.error) ? error.error : { message: '', errors: [] };
  const fields: Record<string, string> = {};
  for (const fieldError of body.errors ?? []) {
    fields[fieldError.field] ??= FIELD_MESSAGES[fieldError.message] ?? fieldError.message;
  }

  return { status: error.status, message: translateMessage(error.status, body.message), fields };
}
