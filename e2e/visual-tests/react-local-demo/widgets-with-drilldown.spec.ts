import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/makeScreenshot';

const { url } = getAppConfig(AppsNames.REACT_LOCAL_DEMO);

test('verify widgets with drilldown page', async ({ page }) => {
  await page.goto(url);
  await page.locator('span', { hasText: 'WidgetsWithDrilldownDemo' }).click();
  await makeScreenshotsOverPage(page);
});
