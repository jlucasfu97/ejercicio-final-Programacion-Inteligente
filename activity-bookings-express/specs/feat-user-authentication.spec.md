# User Authentication and Management Specification

- **Reference**: [PRD](/PRD.md) FR1, TR2, TR3, TR4.
- **Issue**: [F1-user-authentication.issue.json](specs/F1-user-authentication.issue.json)
- **Status**: Draft

## Problem Description

The system needs user authentication and management capabilities to enable secure access to the ActivityBookings API. Users must be able to register with email and password, authenticate to receive JWT tokens, and use those tokens to access protected endpoints. Without authentication, users cannot book activities or access their booking information.

### User Stories

- As a **user**, I want to **register with my email and password** so that **I can create an account to book activities**.
- As a **user**, I want to **login with my email and password** so that **I can receive a JWT token to access protected API endpoints**.
- As a **user**, I want to **use my JWT token to access protected endpoints** so that **I can book activities and view my bookings**.

## Solution Overview

### User/App interface

- `POST /users` - Register a new user with email, username, password, and terms acceptance
- `POST /login` - Authenticate user with email and password, returns user data and JWT access token
- JWT token included in `Authorization: Bearer <token>` header for protected routes
- Authentication middleware validates JWT tokens and extracts user information

### Model and logic

- User entity with id, username, email, password (hashed), terms acceptance, and timestamps
- Password hashing using bcrypt or similar (in-memory implementation for minimal setup)
- JWT token generation with user ID and email in payload
- JWT token validation middleware that extracts user info and attaches to request
- Service layer handles user registration, authentication, and password validation
- Validation ensures email format, password strength, unique email, and required fields

### Persistence

- In-memory Map storage for users (keyed by user ID)
- Email index Map for quick email lookup during registration and login
- Password stored as plain text for minimal setup (production would use hashing)
- User IDs generated as `user-${incrementingId}`

## Acceptance Criteria

- [ ] THE [System] SHALL provide a `POST /users` endpoint that accepts email, username, password, and terms fields
- [ ] WHEN [a user registers with valid data] THE [System] SHALL create a new user account and return user data (without password) with HTTP 201
- [ ] WHEN [a user registers with an email that already exists] THE [System] SHALL return HTTP 400 with validation errors
- [ ] WHEN [a user registers with invalid email format] THE [System] SHALL return HTTP 400 with validation errors
- [ ] WHEN [a user registers with missing required fields] THE [System] SHALL return HTTP 400 with validation errors
- [ ] THE [System] SHALL provide a `POST /login` endpoint that accepts email and password fields
- [ ] WHEN [a user logs in with valid credentials] THE [System] SHALL return user data and JWT access token with HTTP 200
- [ ] WHEN [a user logs in with invalid email] THE [System] SHALL return HTTP 401 with error message
- [ ] WHEN [a user logs in with invalid password] THE [System] SHALL return HTTP 401 with error message
- [ ] THE [System] SHALL generate JWT tokens containing user ID and email in the payload
- [ ] THE [System] SHALL provide JWT authentication middleware that validates tokens and extracts user information
- [ ] WHEN [a request includes a valid JWT token in Authorization header] THE [System] SHALL attach user information to the request object
- [ ] WHEN [a request includes an invalid or missing JWT token] THE [System] SHALL return HTTP 401 with error message
