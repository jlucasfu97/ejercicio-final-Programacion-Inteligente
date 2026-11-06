import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormField, FormRoot, form, max, min, required, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../../core/api';
import { toUiError } from '../../core/api-errors';
import { AuthStore } from '../../core/auth/auth-store';
import { BookingsApi } from '../../core/bookings-api';
import { BOOKABLE_STATUSES, activityStatusLabel } from '../../core/labels';
import { Activity, Booking } from '../../core/models';
import { FieldErrors } from '../../shared/field-errors';

/** Why the booking form is (not) available for the current user */
type BookingAvailability = 'open' | 'login' | 'owner' | 'closed' | 'past';

@Component({
  selector: 'app-activity-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe, FormField, FormRoot, FieldErrors],
  templateUrl: './activity-detail.html',
})
export class ActivityDetail {
  private readonly apiUrl = inject(API_URL);
  private readonly bookingsApi = inject(BookingsApi);
  protected readonly auth = inject(AuthStore);

  /** Route param `:id` */
  readonly id = input.required<string>();

  protected readonly statusLabel = activityStatusLabel;

  protected readonly activityResource = httpResource<Activity>(
    () => `${this.apiUrl}/activities/${encodeURIComponent(this.id())}`
  );
  protected readonly activity = computed(() =>
    this.activityResource.hasValue() ? this.activityResource.value() : undefined
  );
  protected readonly loadError = computed(() => {
    const error = this.activityResource.error();
    return error ? toUiError(error) : null;
  });

  protected readonly availability = computed<BookingAvailability>(() => {
    const activity = this.activity();
    if (!activity) {
      return 'closed';
    }
    if (Date.parse(activity.date) <= Date.now()) {
      return 'past';
    }
    if (!BOOKABLE_STATUSES.includes(activity.status)) {
      return 'closed';
    }
    if (!this.auth.isAuthenticated()) {
      return 'login';
    }
    if (activity.userId === this.auth.userId()) {
      return 'owner';
    }
    return 'open';
  });

  protected readonly bookingError = signal<string | null>(null);
  protected readonly lastBooking = signal<Booking | null>(null);
  protected readonly bookingModel = signal({ participants: 1 });

  protected readonly total = computed(() => {
    const participants = this.bookingModel().participants;
    const price = this.activity()?.price ?? 0;
    return Number.isFinite(participants) && participants > 0 ? price * participants : 0;
  });

  protected readonly bookingForm = form(
    this.bookingModel,
    (path) => {
      required(path.participants, { message: 'Indica el número de plazas' });
      min(path.participants, 1, { message: 'Mínimo 1 plaza' });
      max(path.participants, () => this.activity()?.maxParticipants ?? 1, {
        message: 'Supera el máximo de plazas de la actividad',
      });
      validate(path.participants, ({ value }) =>
        Number.isInteger(value()) ? undefined : { kind: 'integer', message: 'Indica un número entero de plazas' }
      );
    },
    {
      submission: {
        action: async () => {
          const activity = this.activity();
          if (!activity) {
            return undefined;
          }
          this.bookingError.set(null);
          this.lastBooking.set(null);
          try {
            const booking = await firstValueFrom(
              this.bookingsApi.create(activity.id, this.bookingModel().participants)
            );
            this.lastBooking.set(booking);
            this.bookingModel.set({ participants: 1 });
          } catch (error) {
            this.bookingError.set(toUiError(error).message);
          }
          return undefined;
        },
      },
    }
  );
}
