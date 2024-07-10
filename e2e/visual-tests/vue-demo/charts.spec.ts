import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/makeScreenshot';

const { url } = getAppConfig(AppsNames.VUE_DEMO);

test('verify charts page', async ({ page }) => {
  await page.goto(url);

  await makeScreenshotsOverPage(page);
});
