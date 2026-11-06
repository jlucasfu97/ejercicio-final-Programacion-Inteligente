/**
 * Payment status - pending, paid, or refunded
 */
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

/**
 * Domain entity - represents a payment as stored in the system
 */
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
}

/**
 * Context passed to the mock payment gateway for charging
 */
export interface ChargeContext {
  userId: string;
  bookingId: string;
  activityId: string;
}

/**
 * Result of a gateway charge attempt
 */
export interface ChargeResult {
  success: boolean;
}

/**
 * Mock payment gateway adapter contract.
 * Implementations simulate payment processing; no external HTTP calls.
 */
export interface MockPaymentGatewayAdapter {
  charge(amount: number, context: ChargeContext): ChargeResult;
}
