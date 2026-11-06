# Activity Management Specification

- **Reference**: [PRD](/PRD.md) FR2, TR1, TR3, TR4.
- **Issue**: [F2-activity-management.issue.json](specs/F2-activity-management.issue.json)
- **Status**: Draft

## Problem Description

The system needs activity management capabilities to enable activity providers to create, read, update, and delete activities. Activities represent bookable events with properties such as name, slug, price, date, duration, location, participant thresholds, and status. Without activity management, users cannot discover or book activities, and the system cannot track available activities.

### User Stories

- As an **activity provider**, I want to **create activities with all required properties** so that **users can discover and book them**.
- As an **activity provider**, I want to **update my activities** so that **I can modify details like price, date, or capacity**.
- As a **user**, I want to **view available activities** so that **I can discover activities to book**.

## Solution Overview

### User/App interface

- `POST /activities` - Create a new activity (authenticated)
- `GET /activities` - List all activities
- `GET /activities/:id` - Get a specific activity by ID
- `PUT /activities/:id` - Update an existing activity (authenticated, owner only)
- `DELETE /activities/:id` - Delete an activity (authenticated, owner only)
- JWT token required in `Authorization: Bearer <token>` header for create, update, and delete operations

### Model and logic

- Activity entity with id, name, slug, price, date, duration, location, minParticipants, maxParticipants, status, and userId
- Activity IDs generated as `activity-${incrementingId}`
- Slug generation from name (lowercase, spaces to hyphens, special characters removed)
- Validation ensures required fields, valid date (future dates), positive price, valid duration, minParticipants <= maxParticipants, and valid status
- Users can only update or delete their own activities (userId validation)
- Service layer handles activity CRUD operations, validation, and business rules

### Persistence

- In-memory Map storage for activities (keyed by activity ID)
- Activities stored with all properties including userId to track ownership
- Slug index Map for quick slug lookup (if needed for uniqueness validation)

## Acceptance Criteria

- [ ] THE [System] SHALL provide a `POST /activities` endpoint that accepts name, price, date, duration, location, minParticipants, maxParticipants, and status fields
- [ ] WHEN [an authenticated user creates an activity with valid data] THE [System] SHALL create a new activity with generated ID and slug, set userId from JWT token, and return the activity with HTTP 201
- [ ] WHEN [an unauthenticated user attempts to create an activity] THE [System] SHALL return HTTP 401 with error message
- [ ] WHEN [a user creates an activity with missing required fields] THE [System] SHALL return HTTP 400 with validation errors
- [ ] WHEN [a user creates an activity with invalid data (negative price, invalid date, minParticipants > maxParticipants)] THE [System] SHALL return HTTP 400 with validation errors
- [ ] THE [System] SHALL provide a `GET /activities` endpoint that returns a list of all activities
- [ ] WHEN [a user requests the activities list] THE [System] SHALL return all activities with HTTP 200
- [ ] THE [System] SHALL provide a `GET /activities/:id` endpoint that returns a specific activity
- [ ] WHEN [a user requests an existing activity by ID] THE [System] SHALL return the activity data with HTTP 200
- [ ] WHEN [a user requests a non-existent activity by ID] THE [System] SHALL return HTTP 404 with error message
- [ ] THE [System] SHALL provide a `PUT /activities/:id` endpoint that accepts activity fields for update
- [ ] WHEN [an authenticated user updates their own activity with valid data] THE [System] SHALL update the activity and return the updated activity with HTTP 200
- [ ] WHEN [an authenticated user attempts to update another user's activity] THE [System] SHALL return HTTP 403 with error message
- [ ] WHEN [an unauthenticated user attempts to update an activity] THE [System] SHALL return HTTP 401 with error message
- [ ] THE [System] SHALL provide a `DELETE /activities/:id` endpoint for deleting activities
- [ ] WHEN [an authenticated user deletes their own activity] THE [System] SHALL remove the activity and return HTTP 204
- [ ] WHEN [an authenticated user attempts to delete another user's activity] THE [System] SHALL return HTTP 403 with error message
- [ ] WHEN [an unauthenticated user attempts to delete an activity] THE [System] SHALL return HTTP 401 with error message
- [ ] THE [System] SHALL generate unique activity IDs in the format `activity-${incrementingId}`
- [ ] THE [System] SHALL generate activity slugs from the name (lowercase, spaces to hyphens, special characters removed)
- [ ] THE [System] SHALL automatically set the userId field from the authenticated user's JWT token when creating activities
