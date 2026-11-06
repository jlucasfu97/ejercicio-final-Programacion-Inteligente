import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../core/api';
import { toUiError } from '../../core/api-errors';
import { activityStatusLabel, paymentStatusLabel } from '../../core/labels';
import { BookingWithActivity } from '../../core/models';

@Component({
  selector: 'app-booking-list',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './booking-list.html',
})
export class BookingList {
  private readonly apiUrl = inject(API_URL);

  protected readonly statusLabel = activityStatusLabel;
  protected readonly paymentLabel = paymentStatusLabel;

  protected readonly bookings = httpResource<BookingWithActivity[]>(() => `${this.apiUrl}/bookings`);

  /** Upcoming first (by activity date), then past ones */
  protected readonly sorted = computed(() => {
    const list = this.bookings.hasValue() ? [...this.bookings.value()] : [];
    const now = Date.now();
    const upcoming = list.filter((b) => Date.parse(b.activity.date) > now);
    const past = list.filter((b) => Date.parse(b.activity.date) <= now);
    const byDate = (a: BookingWithActivity, b: BookingWithActivity) =>
      Date.parse(a.activity.date) - Date.parse(b.activity.date);
    return [...upcoming.sort(byDate), ...past.sort(byDate).reverse()];
  });

  protected readonly errorMessage = computed(() => {
    const error = this.bookings.error();
    return error ? toUiError(error).message : null;
  });

  protected isPast(booking: BookingWithActivity): boolean {
    return Date.parse(booking.activity.date) <= Date.now();
  }
}
