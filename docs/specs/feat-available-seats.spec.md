# Show remaining seats

- **Type**: feat · **Project**: api + client · **Status**: Draft
- **Reference**: PRD FR7, BR4 · ADD ADR8

## Problem

The briefing asks to show available seats, but the API only exposes `maxParticipants`. Customers discover
there is no room only after trying to book.

## User stories

- As a customer, I want to see how many seats are left so that I choose a launch with room.
- As a customer, I want the form to stop me before asking for more seats than remain.

## Solution outline

- **API**: add a read-only `availableSeats` field (`maxParticipants − booked seats`) to `GET /activities`
  and `GET /activities/:id`. No new endpoint, no persistence change.
- **Client**: show "N plazas libres" in the catalogue and detail; use `availableSeats` as the form maximum;
  show "Completo" when it is 0.

## Acceptance criteria (EARS)

- [ ] THE API SHALL include `availableSeats` in every activity returned by `GET /activities` and `GET /activities/:id`.
- [ ] WHEN a booking is created THE API SHALL return the reduced `availableSeats` on the next read.
- [ ] THE API SHALL ignore `availableSeats` sent in POST or PUT bodies.
- [ ] THE catalogue and detail SHALL show the remaining seats of each launch.
- [ ] THE booking form SHALL not accept more seats than `availableSeats`.
- [ ] IF `availableSeats` is 0 THEN THE detail SHALL show "Completo" and no booking form.

## Plan

_Pending — run `/plan docs/specs/feat-available-seats.spec.md` after approval._
