import * as path from 'path';
import { Repository } from './base.repository';
import { readJsonFile, writeJsonFile, ensureDirectoryExists } from '../utils/file-storage';
import { logger } from '../utils/logger';

/**
 * JSON file-based repository implementation
 * Maintains in-memory Map for fast access and persists to JSON files
 */
export class JsonRepository<T extends { id: string }> implements Repository<T> {
  private entities = new Map<string, T>();
  private entityFilePath: string;
  private seedFilePath: string | undefined;
  private nextId = 1;

  /**
   * @param entityFilePath Path to the entity JSON file (e.g., 'db/activities.json')
   * @param seedFilePath Optional path to seed data file (e.g., 'db/seed/activities.json')
   */
  constructor(entityFilePath: string, seedFilePath?: string) {
    this.entityFilePath = entityFilePath;
    this.seedFilePath = seedFilePath;
  }

  /**
   * Loads data from seed file and persisted file, merging them
   * Persisted data takes precedence over seed data
   */
  load(): void {
    // Load seed data first
    let seedData: T[] = [];
    if (this.seedFilePath) {
      const seed = readJsonFile<T[]>(this.seedFilePath);
      if (seed && Array.isArray(seed)) {
        seedData = seed;
        logger.info('JsonRepository', `Loaded ${seedData.length} entities from seed: ${this.seedFilePath}`);
      }
    }

    // Load persisted data
    let persistedData: T[] = [];
    const persisted = readJsonFile<T[]>(this.entityFilePath);
    if (persisted && Array.isArray(persisted)) {
      persistedData = persisted;
      logger.info('JsonRepository', `Loaded ${persistedData.length} entities from: ${this.entityFilePath}`);
    }

    // Merge: persisted data takes precedence
    const mergedMap = new Map<string, T>();
    
    // First add seed data
    for (const entity of seedData) {
      if (entity.id) {
        mergedMap.set(entity.id, entity);
      }
    }

    // Then override with persisted data
    for (const entity of persistedData) {
      if (entity.id) {
        mergedMap.set(entity.id, entity);
      }
    }

    // Update in-memory Map
    this.entities = mergedMap;

    // Calculate next ID from existing entities
    this.calculateNextId();

    logger.info('JsonRepository', `Loaded ${this.entities.size} total entities for: ${this.entityFilePath}`);
  }

  /**
   * Saves current in-memory state to JSON file
   */
  save(): void {
    try {
      const entitiesArray = Array.from(this.entities.values());
      writeJsonFile(this.entityFilePath, entitiesArray);
      logger.info('JsonRepository', `Saved ${entitiesArray.length} entities to: ${this.entityFilePath}`);
    } catch (error) {
      logger.error('JsonRepository', `Failed to save entities to: ${this.entityFilePath}`, error);
      // Don't throw - allow operation to continue with in-memory data
    }
  }

  /**
   * Gets all entities
   */
  getAll(): T[] {
    return Array.from(this.entities.values());
  }

  /**
   * Gets an entity by ID
   */
  getById(id: string): T | undefined {
    return this.entities.get(id);
  }

  /**
   * Creates a new entity and persists it
   */
  create(entity: T): T {
    this.entities.set(entity.id, entity);
    this.save();
    return entity;
  }

  /**
   * Updates an existing entity and persists changes
   */
  update(id: string, updates: Partial<T>): T | undefined {
    const existing = this.entities.get(id);
    if (!existing) {
      return undefined;
    }

    const updated = { ...existing, ...updates };
    this.entities.set(id, updated);
    this.save();
    return updated;
  }

  /**
   * Deletes an entity and persists changes
   */
  delete(id: string): boolean {
    const deleted = this.entities.delete(id);
    if (deleted) {
      this.save();
    }
    return deleted;
  }

  /**
   * Calculates the next ID based on existing entity IDs
   * Assumes IDs follow pattern: resource-{number}
   */
  private calculateNextId(): void {
    let maxId = 0;
    for (const id of this.entities.keys()) {
      const match = id.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxId) {
          maxId = num;
        }
      }
    }
    this.nextId = maxId + 1;
  }

  /**
   * Gets the next ID (for services that need to generate IDs)
   */
  getNextId(): number {
    return this.nextId++;
  }
}
