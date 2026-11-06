import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';

/**
 * Ensures a directory exists, creating it if necessary
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info('FileStorage', `Created directory: ${dirPath}`);
  }
}

/**
 * Reads a JSON file and returns parsed data
 * Returns undefined if file doesn't exist or is invalid
 */
export function readJsonFile<T>(filePath: string): T | undefined {
  try {
    if (!fs.existsSync(filePath)) {
      return undefined;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    logger.error('FileStorage', `Failed to read JSON file: ${filePath}`, error);
    return undefined;
  }
}

/**
 * Writes data to a JSON file using atomic write pattern (write to temp, then rename)
 * Creates parent directories if they don't exist
 */
export function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const dirPath = path.dirname(filePath);
    ensureDirectoryExists(dirPath);

    const tempPath = `${filePath}.tmp`;
    const jsonContent = JSON.stringify(data, null, 2);
    
    fs.writeFileSync(tempPath, jsonContent, 'utf-8');
    fs.renameSync(tempPath, filePath);
    
    logger.info('FileStorage', `Written JSON file: ${filePath}`);
  } catch (error) {
    logger.error('FileStorage', `Failed to write JSON file: ${filePath}`, error);
    throw error;
  }
}
