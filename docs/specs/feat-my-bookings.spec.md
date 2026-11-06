# My bookings

- **Type**: feat · **Project**: client · **Status**: Done
- **Reference**: PRD FR6

## Problem

Customers need to check what they booked and whether it was paid.

## Acceptance criteria (EARS)

- [x] THE `/bookings` and `/bookings/:id` routes SHALL require login.
- [x] THE bookings list SHALL show, per booking, launch name, seats, amount and payment status.
- [x] IF the user has no bookings THEN THE list SHALL show an empty state with a link to the catalogue.
- [x] WHEN a booking is opened THE client SHALL show amount, seats, booking status and payment status.
- [x] IF the booking does not exist or belongs to another user THEN THE client SHALL show "La reserva no existe.".

## Plan

- [x] `features/bookings/booking-list`, `booking-detail`; routes with `authGuard`.

## Verification

Browser walkthrough: list after booking, detail with amount and "Pagada".
