/** API contracts of the AstroBookings backend */

export type ActivityStatus = 'draft' | 'published' | 'confirmed' | 'sold-out' | 'done' | 'cancelled';

export interface Activity {
  id: string;
  name: string;
  slug: string;
  price: number;
  date: string;
  duration: number;
  location: string;
  minParticipants: number;
  maxParticipants: number;
  status: ActivityStatus;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  activityId: string;
  userId: string;
  participants: number;
  createdAt: string;
  paymentId?: string;
  paymentStatus: PaymentStatus;
}

/** Booking as returned by GET /bookings and GET /bookings/:id */
export interface BookingWithActivity extends Booking {
  activity: Pick<Activity, 'name' | 'slug' | 'price' | 'date' | 'duration' | 'location' | 'status'>;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  terms: boolean;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  terms: boolean;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

/** Standard error body: { message, errors[] } */
export interface ApiErrorBody {
  message: string;
  errors: ApiFieldError[];
}
