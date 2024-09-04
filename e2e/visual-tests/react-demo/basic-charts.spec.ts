import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/make-screenshot';

const { url } = getAppConfig(AppsNames.REACT_DEMO);

// Disabled due to flaky behaviour of demo page related to the issue in chart theming async loading
test.skip('verify chart gallery page', async ({ page }) => {
  await page.goto(url);

  await makeScreenshotsOverPage(page);
});
test.skip('verify chart gallery page with dark theme', async ({ page }) => {
  await page.goto(url);

  await page.locator('button', { hasText: 'Theme Two' }).click();

  await makeScreenshotsOverPage(page);
});

test('verify query driven chart', async ({ page }) => {
  await page.goto(`${url}/query-driven-chart`);

  await makeScreenshotsOverPage(page);
});
