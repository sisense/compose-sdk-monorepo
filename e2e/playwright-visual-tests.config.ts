import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAppsConfig } from './visual-tests/appsConfig';

if (!process.env.CI) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  dotenv.config({ path: resolve(__dirname, '.env.local') });
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './visual-tests',
  snapshotPathTemplate:
    '{testDir}/{testFileDir}/__screenshots__/{testFileName}/{testName}_{arg}{ext}',
  /* Maximum time one test can run for. */
  timeout: 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { port: 5400, host: '0.0.0.0', open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Use `data-visual-testid` as test id attribute */
    testIdAttribute: 'data-visual-testid',
  },
  webServer: process.env.USE_EXTERNAL_HOST ? null : getAppsConfig(),
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--font-render-hinting=none',
            '--disable-skia-runtime-opts',
            '--disable-font-subpixel-positioning',
            '--disable-lcd-text',
            '--disable-system-font-check',
            '--disable-remote-fonts',
          ],
        },
      },
    },
  ],
});
