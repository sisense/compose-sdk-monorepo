import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/makeScreenshot';

const { url } = getAppConfig(AppsNames.REACT_STORYBOOK);

test.describe('boxplot', () => {
  test('verify basic boxplot', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-boxplot--boxplot`);

    await makeScreenshotsOverPage(page);
  });
});
