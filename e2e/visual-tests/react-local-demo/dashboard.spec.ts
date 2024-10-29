import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.REACT_LOCAL_DEMO);

test('verify dashboard page', async ({ page, testHelper }) => {
  await page.goto(url);
  await page.locator('span', { hasText: 'ECommerceDemo' }).click();
  await testHelper.makeScreenshotsOverPage();
});
