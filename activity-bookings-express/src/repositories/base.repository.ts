/**
 * Generic repository interface for data persistence
 */
export interface Repository<T> {
  /**
   * Loads data from storage (seed + persisted) into memory
   */
  load(): Promise<void> | void;

  /**
   * Saves current in-memory state to persistent storage
   */
  save(): Promise<void> | void;

  /**
   * Gets all entities
   */
  getAll(): T[];

  /**
   * Gets an entity by ID
   */
  getById(id: string): T | undefined;

  /**
   * Creates a new entity
   */
  create(entity: T): T;

  /**
   * Updates an existing entity
   */
  update(id: string, entity: Partial<T>): T | undefined;

  /**
   * Deletes an entity by ID
   */
  delete(id: string): boolean;
}
