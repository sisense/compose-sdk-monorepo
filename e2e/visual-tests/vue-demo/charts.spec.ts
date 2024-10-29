import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.VUE_DEMO);

test('verify charts page', async ({ page, testHelper }) => {
  await page.goto(url);

  await testHelper.makeScreenshotsOverPage();
});
