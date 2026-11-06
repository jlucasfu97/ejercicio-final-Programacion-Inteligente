# Book seats on a launch

- **Type**: feat · **Project**: client · **Status**: Done
- **Reference**: PRD FR5

## Problem

Customers must book seats without exceeding capacity and know the total before paying.

## Acceptance criteria (EARS)

- [x] WHILE logged out THE detail page SHALL invite the user to log in instead of showing the form.
- [x] WHILE the user is the organizer THE detail page SHALL show "Eres el organizador" and no form.
- [x] WHILE the launch is closed or past THE detail page SHALL show why booking is unavailable.
- [x] THE booking form SHALL accept only whole numbers from 1 to `maxParticipants`.
- [x] WHEN the seat count changes THE client SHALL show the total (`price × seats`) in euros.
- [x] WHEN the booking succeeds THE client SHALL show "Reserva confirmada: N plazas".
- [x] IF the API rejects for capacity THEN THE client SHALL show "No hay plazas suficientes. Quedan N plazas libres.".
- [x] IF the payment is rejected or the launch is closed THEN THE client SHALL show the translated reason and clear any previous success message.

## Plan

- [x] Booking form in `activity-detail` (Signal Forms: `required`, `min`, `max`, integer `validate`).
- [x] `core/bookings-api.ts`; mappings in `core/api-errors.ts`.

## Verification

Vitest `api-errors.spec.ts`. Browser walkthrough: max validation, total, success, capacity error, owner.
