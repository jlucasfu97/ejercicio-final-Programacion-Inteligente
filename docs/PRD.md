# AstroBookings Client — Product Requirements Document

> Source: [`astrobookings-cli.briefing.md`](../astrobookings-cli.briefing.md). Backend PRD: [`activity-bookings-express/PRD.md`](../activity-bookings-express/PRD.md).

A web client for the AstroBookings API. Customers browse upcoming launches, book seats and check their bookings.

## Vision and scope

**Vision**: booking a seat on a launch takes under a minute, with no surprises about price or availability.

**Users**

- **Visitor**: browses the catalogue without an account.
- **Customer**: registered user who books seats and reviews their bookings.
- **Organizer**: user who created an activity (launch). Cannot book their own launch.

**In scope**: catalogue, search, launch detail, register, login/logout, booking with capacity checks,
my bookings, booking detail, API error messages in Spanish.

**Out of scope (for now)**: organizer screens (create/edit/publish launches), cancellations and refunds,
real payments, notifications, admin roles.

## Functional requirements

| ID | Requirement | Priority | Status | Spec |
|---|---|---|---|---|
| FR1 | Show bookable launches with name, date, location, price and seats | High | Done | `feat-activity-catalog` |
| FR2 | Search launches by text | Medium | Done | `feat-activity-catalog` |
| FR3 | Register a new customer account | High | Done | `feat-client-auth` |
| FR4 | Log in and out; keep session across reloads; expire with the token | High | Done | `feat-client-auth` |
| FR5 | Book N seats on a launch, never exceeding available seats, showing total price | High | Done | `feat-booking-flow` |
| FR6 | List my bookings and see booking + payment status | High | Done | `feat-my-bookings` |
| FR7 | Show **remaining** seats before booking | Medium | Draft | `feat-available-seats` |
| FR8 | Show the rocket of each launch | Low | Not started | — (no API field) |
| FR9 | Organizer: create, edit and publish launches | Low | Not started | — |

## Technical requirements

| ID | Requirement |
|---|---|
| TR1 | Angular 22, standalone, zoneless, signals, Signal Forms |
| TR2 | Talks only to the AstroBookings REST API (`API_URL`, default `http://localhost:3000`) |
| TR3 | JWT stored client-side; sent as `Authorization: Bearer` only to the API |
| TR4 | Minimalist UI, no UI library, light/dark, usable at 375px wide |
| TR5 | UI in Spanish (`es` locale for dates and currency) |
| TR6 | Every requirement covered by automated tests (API: Playwright; client: Vitest + browser checks) |

## Backend requirements discovered while building the client

| ID | Requirement | Status | Spec |
|---|---|---|---|
| BR1 | JWT must be secure (secret from env, algorithm pinned, user must exist) | Done | `bug-jwt-security` |
| BR2 | Login, IDs, capacity and ownership rules must work | Done | `bug-backend-fixes` |
| BR3 | API behaviour covered by REST tests | Done | `chore-api-e2e-tests` |
| BR4 | Endpoint or field with remaining seats per activity | Draft | `feat-available-seats` |
