import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig.js';
import { makeScreenshotsOverPage } from '../__test-helpers__/make-screenshot.js';

const { url } = getAppConfig(AppsNames.VUE_DEMO);

test('verify filters page', async ({ page }) => {
  await page.goto(`${url}/filters`);

  await makeScreenshotsOverPage(page);
});
