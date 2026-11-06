import { ActivityStatus, PaymentStatus } from './models';

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  draft: 'Borrador',
  published: 'Abierta',
  confirmed: 'Confirmada',
  'sold-out': 'Completa',
  done: 'Realizada',
  cancelled: 'Cancelada',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
  refunded: 'Reembolsada',
};

/** Statuses in which the backend accepts new bookings */
export const BOOKABLE_STATUSES: readonly ActivityStatus[] = ['published', 'confirmed'];

/** Statuses shown to customers in the catalogue */
export const VISIBLE_STATUSES: readonly ActivityStatus[] = ['published', 'confirmed', 'sold-out'];

export function activityStatusLabel(status: string): string {
  return ACTIVITY_STATUS_LABELS[status as ActivityStatus] ?? status;
}

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status as PaymentStatus] ?? status;
}
