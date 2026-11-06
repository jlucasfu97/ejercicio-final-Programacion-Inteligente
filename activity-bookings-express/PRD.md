# ActivityBookings Product Requirements Document

A backend API system for managing activity bookings where registered users can discover, book, and pay for scheduled activities. The system handles activity lifecycle management, user authentication, booking reservations with capacity constraints, and payment processing through a mock gateway.

## Vision and Scope

**Vision**: Provide a reliable, secure, and scalable backend API that enables activity providers to offer bookable activities to end users, with automated booking management, payment processing, and capacity control.

**Target Users**: 
- **End Users**: Individuals who want to book activities (identified by email, with username and password)
- **Activity Providers**: Organizations or individuals offering activities (implicitly through the system)

**Problems Solved**:
- Centralized activity discovery and booking management
- Automated capacity control to prevent overbooking
- Secure user authentication and authorization
- Integrated payment processing workflow
- Activity lifecycle management from creation to completion

### Scope

**In Scope**:
- User registration and authentication (email-based with JWT)
- Activity management (CRUD operations)
- Activity status lifecycle management (draft → published → confirmed → done/cancelled)
- Booking creation with capacity validation
- Payment processing integration (mock gateway)
- Activity availability and seat management

**Out of Scope**:
- Frontend user interface (backend API only)
- Real payment gateway integration (mock implementation)
- Activity provider management UI
- Email notifications
- Activity search and filtering (basic retrieval only)
- Booking cancellation by users
- Refund processing automation

## Functional Requirements

### FR1: User Authentication and Management
- **Description**: Users can register and authenticate using email and password, receiving JWT tokens for subsequent API access.
- **Priority**: High
- **Status**: Completed

### FR2: Activity Management
- **Description**: System supports creating, reading, updating, and deleting activities with properties including name, slug, price, date, duration, location, participant thresholds (min/max), and status.
- **Priority**: High
- **Status**: Completed

### FR3: Activity Status Lifecycle
- **Description**: Activities transition through statuses: draft → published → confirmed → done or cancelled, with appropriate business rules for each transition.
- **Priority**: High
- **Status**: Completed

### FR4: Booking Creation with Capacity Validation
- **Description**: Users can book activities, but the system prevents bookings that would exceed available seats (maxParticipants minus existing bookings).
- **Priority**: High
- **Status**: Completed

### FR5: Payment Processing
- **Description**: Upon booking creation, users are automatically billed through a mock payment gateway, with payment status tracked (pending, paid, refunded).
- **Priority**: High
- **Status**: Completed

### FR6: Booking Retrieval
- **Description**: Users can retrieve their own bookings, and the system provides booking details including activity information, participant count, and payment status.
- **Priority**: Medium
- **Status**: Completed

### FR7: Activity Availability Query
- **Description**: System provides endpoints to check activity availability, showing remaining seats and current booking count.
- **Priority**: Medium
- **Status**: NotStarted

## Technical Requirements

### TR1: RESTful API Architecture
- **Description**: Implement a layered Express.js API following RESTful principles with clear separation between controllers, services, and data access layers.
- **Priority**: High
- **Status**: NotStarted

### TR2: JWT-based Authentication
- **Description**: Secure API endpoints using JWT tokens for authentication, with token validation middleware protecting authenticated routes.
- **Priority**: High
- **Status**: Completed

### TR3: TypeScript Implementation
- **Description**: All code must be written in TypeScript with strict typing, following the project's TypeScript coding standards and using the client type definitions from the types folder.
- **Priority**: High
- **Status**: NotStarted

### TR4: Input Validation and Error Handling
- **Description**: All API endpoints must validate input data and return structured error responses with appropriate HTTP status codes. All error responses follow a standardized format: `{ message: string, errors: ValidationError[] }` where `message` provides a summary of the error and `errors` is an array of field-specific validation errors (empty array for non-validation errors).
- **Priority**: High
- **Status**: Completed

### TR5: Mock Payment Gateway Integration
- **Description**: Integrate with a mock payment gateway service that simulates payment processing, handling success and failure scenarios.
- **Priority**: Medium
- **Status**: Completed

### TR6: JSON File-System Store
- **Description**: Use JSON files as the persistence layer in a `/db` folder at project root. The system loads and persists entities via JSON files. Include seed (sample) data so the application starts with predefined activities for development, demos, and testing.
- **Priority**: Medium
- **Status**: Completed
