import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.REACT_STORYBOOK);

test.describe('boxplot', () => {
  test('verify basic boxplot', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-boxplot--boxplot`);

    await testHelper.makeScreenshotsOverPage();
  });
});
