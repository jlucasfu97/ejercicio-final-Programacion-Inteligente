import {
  Activity,
  ActivityStatus,
  CreateActivityRequest,
  UpdateActivityRequest,
  ValidationError,
} from '../types/activity';
import { logger } from '../utils/logger';
import { JsonRepository } from '../repositories/json.repository';
import { Booking } from '../types/booking';

/**
 * Fields an owner may change through PUT /activities/:id
 */
const UPDATABLE_FIELDS = [
  'name',
  'price',
  'date',
  'duration',
  'location',
  'minParticipants',
  'maxParticipants',
] as const satisfies readonly (keyof UpdateActivityRequest)[];

/**
 * Statuses allowed when creating an activity; the rest are reached via PATCH /activities/:id/status
 */
const INITIAL_STATUSES: ActivityStatus[] = ['draft', 'published'];

export class ActivityService {
  constructor(
    private readonly repository: JsonRepository<Activity>,
    private readonly bookingRepository: JsonRepository<Booking>
  ) {}

  /**
   * Total participants already booked for an activity
   */
  getBookedParticipants(activityId: string): number {
    return this.bookingRepository
      .getAll()
      .filter((booking) => booking.activityId === activityId)
      .reduce((sum, booking) => sum + booking.participants, 0);
  }

  /**
   * Creates a new activity
   * Throws if validation fails
   */
  create(req: CreateActivityRequest, userId: string): Activity {
    const errors = this.validateCreate(req);
    if (errors.length > 0) {
      throw new Error('Validation failed');
    }

    const activityId = `activity-${this.repository.getNextId()}`;
    const slug = this.generateSlug(req.name);
    const now = new Date().toISOString();

    const activity: Activity = {
      id: activityId,
      name: req.name,
      slug: slug,
      price: req.price,
      date: req.date,
      duration: req.duration ?? 60,
      location: req.location,
      minParticipants: req.minParticipants,
      maxParticipants: req.maxParticipants,
      status: req.status ?? 'draft',
      userId: userId,
      createdAt: now,
    };

    this.repository.create(activity);
    logger.info('ActivityService', 'Activity created', { id: activityId, name: activity.name });
    return activity;
  }

  /**
   * Retrieves all activities
   * Returns array of all activities
   */
  getAll(): Activity[] {
    return this.repository.getAll();
  }

  /**
   * Queries activities with optional filters, search, and sorting
   * @param options Query options: q (search term), slug (filter by slug), _sort (field to sort by), _order (asc/desc)
   * @returns Filtered and sorted array of activities
   */
  query(options: {
    q?: string;
    slug?: string;
    _sort?: string;
    _order?: 'asc' | 'desc';
  }): Activity[] {
    let results = this.repository.getAll();

    // Filter by slug if provided
    if (options.slug) {
      results = results.filter((activity) => activity.slug === options.slug);
    }

    // Search by query term (searches in name, location, and slug)
    if (typeof options.q === 'string' && options.q.trim() !== '') {
      const searchTerm = options.q.toLowerCase().trim();
      results = results.filter(
        (activity) =>
          activity.name.toLowerCase().includes(searchTerm) ||
          activity.location.toLowerCase().includes(searchTerm) ||
          activity.slug.toLowerCase().includes(searchTerm)
      );
    }

    // Sort results
    if (options._sort) {
      const sortField = options._sort as keyof Activity;
      const order = options._order === 'desc' ? -1 : 1;

      results.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        // Handle undefined/null values
        if (aValue === undefined || aValue === null) {
          return bValue === undefined || bValue === null ? 0 : 1;
        }
        if (bValue === undefined || bValue === null) {
          return -1;
        }

        // Handle date strings (ISO format)
        if (sortField === 'date' || sortField === 'createdAt' || sortField === 'updatedAt') {
          const aDate = new Date(aValue as string).getTime();
          const bDate = new Date(bValue as string).getTime();
          return (aDate - bDate) * order;
        }

        // Handle numbers
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * order;
        }

        // Handle strings
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * order;
        }

        // Fallback: convert to string and compare
        return String(aValue).localeCompare(String(bValue)) * order;
      });
    }

    return results;
  }

  /**
   * Retrieves an activity by ID
   * Returns undefined if not found
   */
  getById(id: string): Activity | undefined {
    return this.repository.getById(id);
  }

  /**
   * Updates an existing activity
   * Throws if validation fails or activity not found
   * Only updates if userId matches
   */
  update(id: string, req: UpdateActivityRequest, userId: string): Activity {
    const activity = this.repository.getById(id);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.userId !== userId) {
      throw new Error('Forbidden: You can only update your own activities');
    }

    const errors = this.validateUpdate(req, activity);
    if (errors.length > 0) {
      throw new Error('Validation failed');
    }

    // Merge ONLY editable fields (never id, userId, slug, status, createdAt...)
    const changes: Partial<Activity> = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req[field] !== undefined) {
        Object.assign(changes, { [field]: req[field] });
      }
    }

    const updatedActivity: Activity = {
      ...activity,
      ...changes,
      // Regenerate slug if name changed
      slug: req.name ? this.generateSlug(req.name) : activity.slug,
      updatedAt: new Date().toISOString(),
    };

    this.repository.update(id, updatedActivity);
    logger.info('ActivityService', 'Activity updated', { id, name: updatedActivity.name });
    return updatedActivity;
  }

  /**
   * Deletes an activity
   * Returns true if deleted, false if not found
   * Only deletes if userId matches
   */
  delete(id: string, userId: string): boolean {
    const activity = this.repository.getById(id);
    if (!activity) {
      return false;
    }

    if (activity.userId !== userId) {
      throw new Error('Forbidden: You can only delete your own activities');
    }

    // Deleting would orphan bookings (and their payments): cancel the activity instead
    if (this.getBookedParticipants(id) > 0) {
      throw new Error('Conflict: Activity has bookings and cannot be deleted. Cancel it instead.');
    }

    this.repository.delete(id);
    logger.info('ActivityService', 'Activity deleted', { id, name: activity.name });
    return true;
  }

  /**
   * Validates create request
   * Returns array of all validation errors (empty if valid)
   */
  validateCreate(data: unknown): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
      return [{ field: 'body', message: 'Request body must be a valid JSON object' }];
    }

    const req = data as Record<string, unknown>;

    // Validate name
    if (!req.name || typeof req.name !== 'string' || req.name.trim() === '') {
      errors.push({ field: 'name', message: 'Name is required and must be a non-empty string' });
    }

    // Validate price (try to parse from string)
    if (req.price === undefined || req.price === null) {
      errors.push({ field: 'price', message: 'Price is required and must be a positive number' });
    } else {
      const price = typeof req.price === 'string' ? Number(req.price) : req.price;
      if (typeof price !== 'number' || isNaN(price) || price <= 0) {
        errors.push({ field: 'price', message: 'Price must be a positive number' });
      }
    }

    // Validate date
    if (!req.date || typeof req.date !== 'string' || req.date.trim() === '') {
      errors.push({ field: 'date', message: 'Date is required and must be a valid ISO date string' });
    } else {
      const date = new Date(req.date);
      if (isNaN(date.getTime())) {
        errors.push({ field: 'date', message: 'Date must be a valid ISO date string' });
      } else {
        // Check if date is in the future
        if (date <= new Date()) {
          errors.push({ field: 'date', message: 'Date must be in the future' });
        }
      }
    }

    // Validate duration (optional, defaults to 60, try to parse from string)
    if (req.duration !== undefined && req.duration !== null) {
      const duration = typeof req.duration === 'string' ? Number(req.duration) : req.duration;
      if (typeof duration !== 'number' || isNaN(duration) || duration <= 0) {
        errors.push({ field: 'duration', message: 'Duration must be a positive number (in minutes)' });
      }
    }

    // Validate location
    if (!req.location || typeof req.location !== 'string' || req.location.trim() === '') {
      errors.push({ field: 'location', message: 'Location is required and must be a non-empty string' });
    }

    // Validate minParticipants (try to parse from string)
    let parsedMinParticipants: number | undefined;
    if (req.minParticipants === undefined || req.minParticipants === null) {
      errors.push({ field: 'minParticipants', message: 'Min participants is required and must be at least 1' });
    } else {
      let parsed: number;
      if (typeof req.minParticipants === 'string') {
        parsed = Number(req.minParticipants);
      } else if (typeof req.minParticipants === 'number') {
        parsed = req.minParticipants;
      } else {
        parsed = NaN;
      }
      parsedMinParticipants = parsed;
      if (typeof parsed !== 'number' || isNaN(parsed) || parsed < 1) {
        errors.push({ field: 'minParticipants', message: 'Min participants must be at least 1' });
      }
    }

    // Validate maxParticipants (try to parse from string)
    let parsedMaxParticipants: number | undefined;
    if (req.maxParticipants === undefined || req.maxParticipants === null) {
      errors.push({ field: 'maxParticipants', message: 'Max participants is required and must be at least 1' });
    } else {
      let parsed: number;
      if (typeof req.maxParticipants === 'string') {
        parsed = Number(req.maxParticipants);
      } else if (typeof req.maxParticipants === 'number') {
        parsed = req.maxParticipants;
      } else {
        parsed = NaN;
      }
      parsedMaxParticipants = parsed;
      if (typeof parsed !== 'number' || isNaN(parsed) || parsed < 1) {
        errors.push({ field: 'maxParticipants', message: 'Max participants must be at least 1' });
      }
    }

    // Validate minParticipants <= maxParticipants
    if (
      parsedMinParticipants !== undefined &&
      parsedMaxParticipants !== undefined &&
      typeof parsedMinParticipants === 'number' &&
      typeof parsedMaxParticipants === 'number' &&
      !isNaN(parsedMinParticipants) &&
      !isNaN(parsedMaxParticipants) &&
      parsedMinParticipants > parsedMaxParticipants
    ) {
      errors.push({
        field: 'minParticipants',
        message: 'Min participants must be less than or equal to max participants',
      });
    }

    // Validate status (optional, defaults to 'draft'); later statuses go through the lifecycle endpoint
    if (req.status !== undefined && req.status !== null) {
      if (typeof req.status !== 'string' || !INITIAL_STATUSES.includes(req.status as ActivityStatus)) {
        errors.push({
          field: 'status',
          message: `Status on creation must be one of: ${INITIAL_STATUSES.join(', ')}. Use PATCH /activities/:id/status afterwards.`,
        });
      }
    }

    return errors;
  }

  /**
   * Validates update request
   * Returns array of all validation errors (empty if valid)
   */
  validateUpdate(data: unknown, existingActivity: Activity): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
      return [{ field: 'body', message: 'Request body must be a valid JSON object' }];
    }

    const req = data as Record<string, unknown>;

    // Validate name if provided
    if (req.name !== undefined) {
      if (typeof req.name !== 'string' || req.name.trim() === '') {
        errors.push({ field: 'name', message: 'Name must be a non-empty string' });
      }
    }

    // Validate price if provided
    if (req.price !== undefined) {
      if (typeof req.price !== 'number' || req.price <= 0) {
        errors.push({ field: 'price', message: 'Price must be a positive number' });
      }
    }

    // Validate date if provided
    if (req.date !== undefined) {
      if (typeof req.date !== 'string' || req.date.trim() === '') {
        errors.push({ field: 'date', message: 'Date must be a valid ISO date string' });
      } else {
        const date = new Date(req.date);
        if (isNaN(date.getTime())) {
          errors.push({ field: 'date', message: 'Date must be a valid ISO date string' });
        } else {
          // Check if date is in the future
          if (date <= new Date()) {
            errors.push({ field: 'date', message: 'Date must be in the future' });
          }
        }
      }
    }

    // Validate duration if provided
    if (req.duration !== undefined) {
      if (typeof req.duration !== 'number' || req.duration <= 0) {
        errors.push({ field: 'duration', message: 'Duration must be a positive number (in minutes)' });
      }
    }

    // Validate location if provided
    if (req.location !== undefined) {
      if (typeof req.location !== 'string' || req.location.trim() === '') {
        errors.push({ field: 'location', message: 'Location must be a non-empty string' });
      }
    }

    // Validate minParticipants if provided
    if (req.minParticipants !== undefined) {
      if (typeof req.minParticipants !== 'number' || req.minParticipants < 1) {
        errors.push({ field: 'minParticipants', message: 'Min participants must be at least 1' });
      }
    }

    // Validate maxParticipants if provided
    if (req.maxParticipants !== undefined) {
      if (typeof req.maxParticipants !== 'number' || req.maxParticipants < 1) {
        errors.push({ field: 'maxParticipants', message: 'Max participants must be at least 1' });
      }
    }

    // Validate minParticipants <= maxParticipants
    const minParticipants = req.minParticipants !== undefined ? req.minParticipants : existingActivity.minParticipants;
    const maxParticipants = req.maxParticipants !== undefined ? req.maxParticipants : existingActivity.maxParticipants;
    if (typeof minParticipants === 'number' && typeof maxParticipants === 'number' && minParticipants > maxParticipants) {
      errors.push({
        field: 'minParticipants',
        message: 'Min participants must be less than or equal to max participants',
      });
    }

    // Capacity cannot drop below the seats already booked
    if (typeof req.maxParticipants === 'number') {
      const booked = this.getBookedParticipants(existingActivity.id);
      if (req.maxParticipants < booked) {
        errors.push({
          field: 'maxParticipants',
          message: `Max participants cannot be lower than the ${booked} seats already booked`,
        });
      }
    }

    // Validate status if provided - status changes must go through PATCH /activities/:id/status endpoint
    if (req.status !== undefined) {
      errors.push({
        field: 'status',
        message: 'Status cannot be changed via PUT endpoint. Use PATCH /activities/:id/status to transition status.',
      });
    }

    return errors;
  }

  /**
   * Returns valid next statuses for a given current status
   * Useful for error messages and validation
   */
  getValidTransitions(currentStatus: ActivityStatus): ActivityStatus[] {
    const transitionMap: Record<ActivityStatus, ActivityStatus[]> = {
      draft: ['published'],
      published: ['confirmed', 'cancelled', 'sold-out'],
      confirmed: ['done', 'cancelled'],
      'sold-out': ['confirmed'],
      done: [], // Terminal state - no transitions allowed
      cancelled: [], // Terminal state - no transitions allowed
    };

    return transitionMap[currentStatus] || [];
  }

  /**
   * Validates if a status transition is allowed
   * Returns true if transition is valid, false otherwise
   */
  isValidStatusTransition(currentStatus: ActivityStatus, targetStatus: ActivityStatus): boolean {
    const validTransitions = this.getValidTransitions(currentStatus);
    return validTransitions.includes(targetStatus);
  }

  /**
   * Transitions an activity to a new status
   * Validates the transition and ownership
   * Throws if validation fails, activity not found, or ownership mismatch
   */
  transitionStatus(id: string, targetStatus: ActivityStatus, userId: string): Activity {
    const activity = this.repository.getById(id);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (activity.userId !== userId) {
      throw new Error('Forbidden: You can only transition your own activities');
    }

    if (!this.isValidStatusTransition(activity.status, targetStatus)) {
      const validTransitions = this.getValidTransitions(activity.status);
      throw new Error(
        `Invalid status transition from ${activity.status} to ${targetStatus}. Valid transitions are: ${validTransitions.join(', ') || 'none (terminal state)'}`
      );
    }

    const updatedActivity: Activity = {
      ...activity,
      status: targetStatus,
      updatedAt: new Date().toISOString(),
    };

    this.repository.update(id, updatedActivity);
    logger.info('ActivityService', 'Activity status transitioned', {
      id,
      from: activity.status,
      to: targetStatus,
    });
    return updatedActivity;
  }

  /**
   * Generates a URL-friendly slug from a name
   * Converts to lowercase, replaces spaces with hyphens, removes special characters
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
}
