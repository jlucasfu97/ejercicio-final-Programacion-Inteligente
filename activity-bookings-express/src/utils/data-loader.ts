import { JsonRepository } from '../repositories/json.repository';
import { Activity } from '../types/activity';
import { User } from '../types/user';
import { Booking } from '../types/booking';
import { Payment } from '../types/payment';
import * as path from 'path';
import { logger } from './logger';

/**
 * Repository instances - shared across the application
 * DB_DIR env var selects the data folder (defaults to `db`); tests point it to an isolated copy
 */
const DB_DIR = process.env.DB_DIR || 'db';
const dbPath = (file: string): string => path.join(DB_DIR, file);

export const activityRepository = new JsonRepository<Activity>(dbPath('activities.json'), dbPath('seed/activities.json'));
export const userRepository = new JsonRepository<User>(dbPath('users.json'));
export const bookingRepository = new JsonRepository<Booking>(dbPath('bookings.json'));
export const paymentRepository = new JsonRepository<Payment>(dbPath('payments.json'));

/**
 * Loads all seed data and persisted data on application startup
 */
export function loadAllData(): void {
  logger.info('DataLoader', 'Loading data from repositories...');
  
  try {
    activityRepository.load();
    logger.info('DataLoader', 'Activities loaded');
  } catch (error) {
    logger.error('DataLoader', 'Failed to load activities', error);
  }

  try {
    userRepository.load();
    logger.info('DataLoader', 'Users loaded');
  } catch (error) {
    logger.error('DataLoader', 'Failed to load users', error);
  }

  try {
    bookingRepository.load();
    logger.info('DataLoader', 'Bookings loaded');
  } catch (error) {
    logger.error('DataLoader', 'Failed to load bookings', error);
  }

  try {
    paymentRepository.load();
    logger.info('DataLoader', 'Payments loaded');
  } catch (error) {
    logger.error('DataLoader', 'Failed to load payments', error);
  }

  logger.info('DataLoader', 'Data loading completed');
}
