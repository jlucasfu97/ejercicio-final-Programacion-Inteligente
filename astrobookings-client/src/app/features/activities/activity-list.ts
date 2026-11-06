import { CurrencyPipe, DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { API_URL } from '../../core/api';
import { toUiError } from '../../core/api-errors';
import { VISIBLE_STATUSES, activityStatusLabel } from '../../core/labels';
import { Activity } from '../../core/models';

@Component({
  selector: 'app-activity-list',
  imports: [RouterLink, DatePipe, CurrencyPipe],
  templateUrl: './activity-list.html',
})
export class ActivityList {
  private readonly apiUrl = inject(API_URL);

  protected readonly statusLabel = activityStatusLabel;
  protected readonly query = signal('');

  /** Search text sent to the API (`q`), debounced to avoid a request per keystroke */
  private readonly searchTerm = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      map((q) => q.trim()),
      distinctUntilChanged()
    ),
    { initialValue: '' }
  );

  protected readonly activities = httpResource<Activity[]>(() => {
    const q = this.searchTerm();
    const params: Record<string, string> = { _sort: 'date' };
    if (q) {
      params['q'] = q;
    }
    return { url: `${this.apiUrl}/activities`, params };
  });

  /** Catalogue: open/confirmed/full activities that have not happened yet */
  protected readonly visible = computed(() => {
    const list = this.activities.hasValue() ? this.activities.value() : [];
    const now = Date.now();
    return list.filter((a) => VISIBLE_STATUSES.includes(a.status) && Date.parse(a.date) > now);
  });

  protected readonly errorMessage = computed(() => {
    const error = this.activities.error();
    return error ? toUiError(error).message : null;
  });
}
