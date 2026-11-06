import { loadAllData, activityRepository, userRepository, bookingRepository, paymentRepository } from './utils/data-loader';
import { ActivityService } from './services/activity.service';
import { UserService } from './services/user.service';
import { PaymentService } from './services/payment.service';
import { BookingService } from './services/booking.service';
import { MockPaymentGateway } from './services/mock-payment-gateway';

/**
 * Composition root.
 * Loads persisted data FIRST and then creates a single shared instance of each service,
 * so every router works over the same, fully loaded state.
 */
loadAllData();

export const userService = new UserService(userRepository);
export const activityService = new ActivityService(activityRepository, bookingRepository);
export const paymentService = new PaymentService(new MockPaymentGateway(), paymentRepository);
export const bookingService = new BookingService(activityService, paymentService, bookingRepository);
