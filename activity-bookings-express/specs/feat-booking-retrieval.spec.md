# Booking Retrieval Specification

- **Reference**: [PRD](/PRD.md) FR6, TR1, TR3, TR4.
- **Issue**: [F6-booking-retrieval.issue.json](specs/F6-booking-retrieval.issue.json)
- **Status**: Draft

## Problem Description

Users need to retrieve their own bookings to view booking details, including activity information, participant count, and payment status. Without booking retrieval functionality, users cannot access information about their bookings after creation, making it impossible to track reservations, view booking history, or verify booking details.

### User Stories

- As a **user**, I want to **retrieve a list of all my bookings** so that **I can see my booking history and upcoming reservations**.
- As a **user**, I want to **retrieve details of a specific booking** so that **I can view complete information about that reservation**.
- As a **user**, I want to **see activity information included with my bookings** so that **I can understand what activity I booked without making additional API calls**.

## Solution Overview

### User/App interface

- `GET /bookings` - Retrieve all bookings for the authenticated user
- `GET /bookings/:id` - Retrieve a specific booking by ID for the authenticated user
- JWT token required in `Authorization: Bearer <token>` header
- Returns booking(s) with HTTP 200 on success
- Returns HTTP 401 if unauthenticated
- Returns HTTP 404 if booking not found or does not belong to the user
- Booking response includes booking details with activity information and payment status

### Model and logic

- Booking retrieval filtered by authenticated user's userId from JWT token
- Users can only retrieve their own bookings (security constraint)
- Booking response includes:
  - Booking entity fields (id, activityId, userId, participants, createdAt)
  - Activity information (name, slug, price, date, duration, location, status)
  - Payment status (pending, paid, refunded) - placeholder for future FR5 implementation
- Service layer handles booking retrieval, user authorization, and data enrichment
- Validation ensures booking exists and belongs to the requesting user

### Persistence

- Retrieve bookings from in-memory Map storage filtered by userId
- Enrich booking data with activity information from ActivityService
- Payment status retrieved from payment service (placeholder for FR5)

## Acceptance Criteria

- [ ] THE [System] SHALL provide a `GET /bookings` endpoint that returns all bookings for the authenticated user
- [ ] THE [System] SHALL provide a `GET /bookings/:id` endpoint that returns a specific booking by ID for the authenticated user
- [ ] WHEN [an authenticated user requests their bookings] THE [System] SHALL return HTTP 200 with an array of booking objects including booking details, activity information, and payment status
- [ ] WHEN [an authenticated user requests a specific booking by ID] THE [System] SHALL return HTTP 200 with the booking object if it exists and belongs to the user
- [ ] WHEN [an unauthenticated user attempts to retrieve bookings] THE [System] SHALL return HTTP 401 with error message
- [ ] WHEN [an authenticated user requests a booking that does not exist] THE [System] SHALL return HTTP 404 with error message
- [ ] WHEN [an authenticated user requests a booking that belongs to another user] THE [System] SHALL return HTTP 404 with error message (security: do not reveal existence of other users' bookings)
- [ ] THE [System] SHALL include activity information (name, slug, price, date, duration, location, status) in booking responses
- [ ] THE [System] SHALL include payment status in booking responses (placeholder: default to 'pending' until FR5 is implemented)
