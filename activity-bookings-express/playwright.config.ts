import { defineConfig } from '@playwright/test';

const PORT = 3100;

/**
 * API-only E2E tests (no browser needed).
 * Starts a dedicated server over an isolated, freshly copied data folder (tests/.db),
 * so running the suite never touches the real db/ files.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    extraHTTPHeaders: { Accept: 'application/json' },
  },
  webServer: {
    command: 'node tests/support/prepare-db.mjs && npx tsx src/index.ts',
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(PORT),
      DB_DIR: 'tests/.db',
      JWT_SECRET: 'playwright-test-secret',
    },
  },
});
