import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_URL } from '../../core/api';
import { toUiError } from '../../core/api-errors';
import { activityStatusLabel, paymentStatusLabel } from '../../core/labels';
import { BookingWithActivity } from '../../core/models';

@Component({
  selector: 'app-booking-detail',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './booking-detail.html',
})
export class BookingDetail {
  private readonly apiUrl = inject(API_URL);

  /** Route param `:id` */
  readonly id = input.required<string>();

  protected readonly statusLabel = activityStatusLabel;
  protected readonly paymentLabel = paymentStatusLabel;

  protected readonly bookingResource = httpResource<BookingWithActivity>(
    () => `${this.apiUrl}/bookings/${encodeURIComponent(this.id())}`
  );
  protected readonly booking = computed(() =>
    this.bookingResource.hasValue() ? this.bookingResource.value() : undefined
  );
  protected readonly loadError = computed(() => {
    const error = this.bookingResource.error();
    return error ? toUiError(error) : null;
  });
}
