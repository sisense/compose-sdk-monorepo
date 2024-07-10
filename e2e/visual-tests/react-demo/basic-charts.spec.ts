import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/makeScreenshot';

const { url } = getAppConfig(AppsNames.REACT_DEMO);

test('verify chart gallery page', async ({ page }) => {
  await page.goto(url);

  await makeScreenshotsOverPage(page);
});

test('verify chart gallery page with dark theme', async ({ page }) => {
  await page.goto(url);

  await page.locator('button', { hasText: 'Theme Two' }).click();

  await makeScreenshotsOverPage(page);
});
