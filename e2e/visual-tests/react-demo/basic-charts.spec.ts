import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.REACT_DEMO);

// Disabled due to flaky behaviour of demo page related to the issue in chart theming async loading
test.skip('verify chart gallery page', async ({ page, testHelper }) => {
  await page.goto(url);

  await testHelper.makeScreenshotsOverPage();
});
test.skip('verify chart gallery page with dark theme', async ({ page, testHelper }) => {
  await page.goto(url);

  await page.locator('button', { hasText: 'Theme Two' }).click();

  await testHelper.makeScreenshotsOverPage();
});

test('verify query driven chart', async ({ page, testHelper }) => {
  await page.goto(`${url}/query-driven-chart`);

  await testHelper.makeScreenshotsOverPage();
});
