import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.ANGULAR_DEMO);

test('verify components', async ({ page, testHelper }) => {
  await page.goto(url);
  await page.waitForTimeout(1000);
  await testHelper.makeScreenshotsOverPage();
});
