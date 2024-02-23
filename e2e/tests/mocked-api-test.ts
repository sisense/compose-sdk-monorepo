import { test as base } from '@playwright/experimental-ct-react';
import mockGlobals from './__mocks__/mock-globals';
import mockPalettes from './__mocks__/mock-palettes';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock common API calls made to Sisense server for CSDK components
    await page.route('**/api/globals?*', async (route) => route.fulfill({ json: mockGlobals }));
    await page.route('**/api/palettes/*', async (route) => route.fulfill({ json: mockPalettes }));
    await page.route('**/api/activities?*', async (route) => route.fulfill());

    await use(page);
  },
});

export { expect } from '@playwright/experimental-ct-react';
