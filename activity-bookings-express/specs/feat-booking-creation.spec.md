# Booking Creation with Capacity Validation Specification

- **Reference**: [PRD](/PRD.md) FR4, TR1, TR3, TR4.
- **Issue**: [F4-booking-creation.issue.json](specs/F4-booking-creation.issue.json)
- **Status**: Draft

## Problem Description

Users need to be able to book activities, but the system must prevent overbooking by ensuring that bookings do not exceed the available capacity (maxParticipants). Without booking creation, users cannot reserve spots for activities, and without capacity validation, the system could allow more bookings than available seats, leading to overbooking issues.

### User Stories

- As a **user**, I want to **book an activity with a specific number of participants** so that **I can reserve spots for myself and others**.
- As a **user**, I want to **receive an error when trying to book more seats than available** so that **I know the activity is fully booked**.
- As a **system**, I want to **prevent bookings that exceed available capacity** so that **activities are not overbooked**.

## Solution Overview

### User/App interface

- `POST /bookings` - Create a new booking (authenticated)
- Request body: `{ activityId: string, participants: number }`
- JWT token required in `Authorization: Bearer <token>` header
- Returns booking with HTTP 201 on success
- Returns HTTP 400 with validation errors if capacity exceeded or invalid data
- Returns HTTP 404 if activity not found
- Returns HTTP 401 if unauthenticated

### Model and logic

- Booking entity with id, activityId, userId, participants, createdAt
- Booking IDs generated as `booking-${incrementingId}`
- Capacity validation: total participants from existing bookings + new booking participants must not exceed activity.maxParticipants
- Users can only book activities (cannot book their own activities if they are the provider)
- Service layer handles booking creation, capacity calculation, and validation
- Validation ensures activity exists, participants is positive, and capacity is available

### Persistence

- In-memory Map storage for bookings (keyed by booking ID)
- Bookings stored with activityId, userId, participants, and timestamps
- Capacity calculated by summing participants from all bookings for an activity

## Acceptance Criteria

- [ ] THE [System] SHALL provide a `POST /bookings` endpoint that accepts activityId and participants fields
- [ ] WHEN [an authenticated user creates a booking with valid data and available capacity] THE [System] SHALL create a new booking with generated ID, set userId from JWT token, and return the booking with HTTP 201
- [ ] WHEN [an unauthenticated user attempts to create a booking] THE [System] SHALL return HTTP 401 with error message
- [ ] WHEN [a user creates a booking with missing required fields] THE [System] SHALL return HTTP 400 with validation errors
- [ ] WHEN [a user creates a booking with invalid data (non-existent activityId, non-positive participants)] THE [System] SHALL return HTTP 400 with validation errors or HTTP 404 if activity not found
- [ ] WHEN [a user attempts to book more participants than available capacity] THE [System] SHALL return HTTP 400 with error message indicating capacity exceeded
- [ ] WHEN [a user attempts to book an activity that is already fully booked] THE [System] SHALL return HTTP 400 with error message indicating no available seats
- [ ] THE [System] SHALL calculate available capacity as activity.maxParticipants minus sum of participants from all existing bookings for that activity
- [ ] THE [System] SHALL generate unique booking IDs in the format `booking-${incrementingId}`
- [ ] THE [System] SHALL automatically set the userId field from the authenticated user's JWT token when creating bookings
