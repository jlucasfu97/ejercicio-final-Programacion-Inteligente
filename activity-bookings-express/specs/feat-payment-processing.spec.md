# Payment Processing Specification

- **Reference**: [PRD](/PRD.md) FR5, TR5.
- **Issue**: [F5-payment-processing.issue.json](specs/F5-payment-processing.issue.json)
- **Status**: Completed

## Problem Description

When users book an activity, the system must charge them through a payment gateway and record the payment outcome. Without payment processing, bookings would be confirmed without collecting payment. The system needs a mock payment gateway integration to simulate charging, support success and failure scenarios, and track payment status (pending, paid, refunded) for each booking.

### User Stories

- As a **user**, I want to **be charged automatically when I create a booking** so that **my reservation is paid and confirmed in one step**.
- As a **user**, I want to **receive a clear error when payment fails** so that **I know the booking was not created and I can retry**.
- As a **system**, I want to **track payment status per booking** so that **we know which bookings are paid, pending, or refunded**.

## Solution Overview

### User/App interface

- Payment is **implicit** in `POST /bookings`: no separate payment endpoint.
- When `POST /bookings` succeeds, the user has been charged; the response includes the booking with `paymentStatus`.
- When the mock gateway rejects the charge, the system returns **HTTP 402 Payment Required** with an error message; **no booking is created**.
- Existing behaviour for validation, capacity, and activity-not-found remains unchanged (400, 404, etc.).

### Model and logic

- **Payment** entity: `id`, `bookingId`, `amount`, `status`, `createdAt`. Status: `'pending' | 'paid' | 'refunded'`.
- **Booking** entity extended with `paymentId` and `paymentStatus` (derived from payment or stored for convenience).
- **Mock payment gateway**: Adapter that accepts `amount` (and any minimal context, e.g. `userId`, `bookingId`) and returns success or failure. No external HTTP calls; configurable or deterministic behaviour (e.g. fail on specific amounts or random) to simulate failures.
- Flow: validate request → check activity and capacity → call mock gateway with `amount = activity.price * participants` → if failure, return 402 and stop; if success, create payment (status `paid`), create booking, link booking to payment, return 201 with booking including `paymentStatus`.

### Persistence

- In-memory storage for payments (e.g. `Map` keyed by payment ID).
- Payments and bookings stored in the same process; booking creation and payment creation are done in one logical flow (no separate DB transactions).

## Acceptance Criteria

- [ ] THE [System] SHALL charge the user via the mock payment gateway when creating a booking, using `amount = activity.price * participants`.
- [ ] WHEN [the mock gateway returns success] THE [System] SHALL create a payment with status `paid`, create the booking, link the booking to the payment, and return HTTP 201 with the booking including `paymentStatus`.
- [ ] WHEN [the mock gateway returns failure] THE [System] SHALL not create a booking nor a payment, and SHALL return HTTP 402 with an error message indicating payment could not be processed.
- [ ] THE [System] SHALL track payment status per booking; each payment has status one of `pending`, `paid`, or `refunded`.
- [ ] THE [System] SHALL support a configurable or deterministic way for the mock gateway to simulate both success and failure (e.g. for testing).
- [ ] WHEN [a user creates a booking with valid data and available capacity] THE [System] SHALL create the booking only after a successful payment; the response SHALL include `paymentId` and `paymentStatus`.
- [ ] THE [System] SHALL generate unique payment IDs in a consistent format (e.g. `payment-${id}`).
- [ ] Existing validation, capacity, and activity-not-found behaviour for `POST /bookings` SHALL remain unchanged; payment is attempted only after those checks pass.
