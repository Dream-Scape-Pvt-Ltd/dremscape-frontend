import {defineConfig} from '@playwright/test';

/**
 * Browser tests for the staff CRM. They run against already-started dev
 * servers (Next on 3000, Django on 8001) — see e2e/README.md.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  expect: {timeout: 20_000},
  workers: 1,
  retries: 0,
  reporter: [['list'], ['json', {outputFile: 'test-results/e2e-report.json'}]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:3000',
    // Uses the locally installed Chrome, so no Playwright browser download is needed.
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
