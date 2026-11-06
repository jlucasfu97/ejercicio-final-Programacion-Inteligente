# Launch catalogue, search and detail

- **Type**: feat · **Project**: client · **Status**: Done
- **Reference**: PRD FR1, FR2 · ADD ADR8

## Problem

Customers need to find upcoming launches and see their details before booking.

## Acceptance criteria (EARS)

- [x] WHEN `/` is opened THE client SHALL redirect to `/activities`.
- [x] THE catalogue SHALL list only `published`, `confirmed` or `sold-out` launches with a future date, sorted by date.
- [x] THE catalogue SHALL show name, date, location, price and max seats per launch.
- [x] WHEN the user types in search THE client SHALL query `GET /activities?q=` after a short debounce.
- [x] IF no launch matches THEN THE client SHALL show an empty-state message.
- [x] WHEN a launch is opened THE client SHALL show its full detail.
- [x] IF the launch does not exist THEN THE client SHALL show "La actividad no existe.".
- [x] THE catalogue SHALL have no horizontal scroll at 375px width.

## Plan

- [x] `features/activities/activity-list` (`httpResource`, debounced `q`, `_sort=date`).
- [x] `features/activities/activity-detail`; `core/labels.ts` (`VISIBLE_STATUSES`).

## Verification

Browser walkthrough: catalogue, search, empty state, detail, unknown id, mobile width.
