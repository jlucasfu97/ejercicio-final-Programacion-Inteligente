export const logger = {
  info(component: string, message: string, data?: unknown): void {
    console.log(`[${component}] ${message}`, data ? JSON.stringify(data) : '');
  },
  error(component: string, message: string, data?: unknown): void {
    console.error(`[${component}] ERROR: ${message}`, data ? JSON.stringify(data) : '');
  },
  warn(component: string, message: string, data?: unknown): void {
    console.warn(`[${component}] WARN: ${message}`, data ? JSON.stringify(data) : '');
  },
};
