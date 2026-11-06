# Backend business-rule and data fixes

- **Type**: bug · **Project**: api · **Status**: Done
- **Reference**: PRD BR2 · ADD ADR2, ADR4

## Problem

Services were created before data was loaded: seeded users could not log in and new IDs collided with
existing ones. Passwords were stored in plain text. Capacity, ownership and status rules had gaps
(over-booking, booking drafts or past activities, mass assignment on PUT, deleting booked activities).

## Acceptance criteria (EARS)

- [x] WHEN the API starts THE API SHALL load all data before creating services.
- [x] THE API SHALL generate IDs that never collide with persisted ones.
- [x] THE API SHALL store passwords as salted scrypt hashes and migrate plain-text ones on login.
- [x] IF a booking would exceed `maxParticipants` minus booked seats THEN THE API SHALL respond 400.
- [x] IF the activity is not `published`/`confirmed`, or its date is past, THEN THE API SHALL reject the booking with 400.
- [x] IF the user is the activity owner THEN THE API SHALL reject the booking with 400.
- [x] WHEN a PUT is received THE API SHALL check ownership first (403) and update only whitelisted fields.
- [x] IF `maxParticipants` is lowered below booked seats THEN THE API SHALL respond 400.
- [x] IF an activity with bookings is deleted THEN THE API SHALL respond 409.

## Plan

- [x] `src/container.ts` composition root; routes use it.
- [x] `src/utils/password.ts`; `user.service.ts` hashes and migrates.
- [x] Rules in `activity.service.ts` and `booking.service.ts`; JSON 404/400/500 handlers in `index.ts`.
- [x] Seed dates moved to the future; README "Booking rules"; CHANGELOG 1.10.1.

## Verification

`tests/activities.spec.ts`, `tests/bookings.spec.ts`, `tests/users.spec.ts`.
Gap: "cannot book a past activity" has no test yet (see BACKLOG ideas).
