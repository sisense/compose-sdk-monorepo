import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig.js';

const { url } = getAppConfig(AppsNames.VUE_DEMO);

test('verify filters page', async ({ page, testHelper }) => {
  await page.goto(`${url}/filters`);

  await testHelper.makeScreenshotsOverPage();
});
