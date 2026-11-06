import { Component, Signal, computed, input } from '@angular/core';

/** Minimal view of a Signal Forms field state needed to show its errors */
export interface FieldStateLike {
  touched: Signal<boolean>;
  errors: Signal<readonly { message?: string }[]>;
}

/** Shows the first error of a field once the user has interacted with it */
@Component({
  selector: 'app-field-errors',
  template: `
    @if (message(); as text) {
      <small class="field-error" role="alert">{{ text }}</small>
    }
  `,
})
export class FieldErrors {
  readonly state = input.required<FieldStateLike>();

  protected readonly message = computed(() => {
    const state = this.state();
    return state.touched() ? (state.errors()[0]?.message ?? null) : null;
  });
}
