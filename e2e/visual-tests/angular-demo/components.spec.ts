import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/make-screenshot';

const { url } = getAppConfig(AppsNames.ANGULAR_DEMO);

test('verify components', async ({ page }) => {
  await page.goto(url);

  await page.waitForTimeout(1000);

  await makeScreenshotsOverPage(page);
});
