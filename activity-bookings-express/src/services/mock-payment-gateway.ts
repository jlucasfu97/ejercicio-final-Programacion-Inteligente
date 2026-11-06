import { ChargeContext, ChargeResult, MockPaymentGatewayAdapter } from '../types/payment';
import { logger } from '../utils/logger';

/**
 * Mock payment gateway that simulates success and failure.
 * Deterministic failure: when amount is divisible by 1000, charge fails.
 * Use this to test HTTP 402 and "payment could not be processed" flows.
 */
export class MockPaymentGateway implements MockPaymentGatewayAdapter {
  charge(amount: number, _context: ChargeContext): ChargeResult {
    const fail = amount > 0 && amount % 1000 === 0;
    if (fail) {
      logger.info('MockPaymentGateway', 'Simulated payment failure', { amount });
      return { success: false };
    }
    logger.info('MockPaymentGateway', 'Simulated payment success', { amount });
    return { success: true };
  }
}
