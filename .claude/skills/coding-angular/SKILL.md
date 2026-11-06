---
name: coding-angular
description: Conventions for building screens, forms and services in astrobookings-client with Angular 22 (standalone, zoneless, signals, Signal Forms, httpResource). Use whenever editing client src/.
---

# Coding the Angular client

## New screen
1. `features/<area>/<name>.ts` + `.html` (+ `.css` only if needed). Standalone, `ChangeDetectionStrategy.OnPush`.
2. Lazy route in `app.routes.ts` with `loadComponent`; `authGuard` if private, `guestGuard` for login/register.
3. Route params as `input()` (enabled by `withComponentInputBinding`).

## Reading data
```ts
private readonly api = inject(API_URL);
readonly id = input.required<string>();
readonly activity = httpResource<Activity>(() => `${this.api}/activities/${this.id()}`);
```
Template: `@if (activity.isLoading())`, `@if (activity.error(); as e) { {{ toUiError(e).message }} }`, `@if (activity.value(); as a)`.

## Forms (Signal Forms)
```ts
readonly model = signal({ participants: 1 });
readonly bookingForm = form(this.model, (p) => {
  required(p.participants, { message: 'Indica el número de plazas' });
  min(p.participants, 1, { message: 'Mínimo 1 plaza' });
  max(p.participants, () => this.activity()?.maxParticipants ?? 1, { message: 'Supera el máximo de plazas' });
}, { submission: { action: async () => { /* HttpClient call, map errors with toUiError */ } } });
```
Template: `<form [formRoot]="bookingForm">`, `<input type="number" [formField]="bookingForm.participants">`,
`<app-field-errors [state]="bookingForm.participants()" />`.
- No `min`/`max`/`required` HTML attributes on `[formField]` inputs (NG8022) — use schema validators.
- Server field errors: map onto the field via `toUiError()` result.

## Errors and texts
- `core/api-errors.ts` → `toUiError(err)` returns `{ message, fields }` in Spanish. Add mappings + tests there.
- Labels for statuses in `core/labels.ts`. Dates/currency with the `es` locale pipes.

## Style
- Use variables from `styles.css`; no UI libraries; check 375px and dark mode.
- Accessibility: labels for inputs, `role="alert"` for errors, buttons disabled while submitting.
