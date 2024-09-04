import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/make-screenshot';

const { url } = getAppConfig(AppsNames.REACT_STORYBOOK);

test.describe('indicator', () => {
  test('verify simple vertical numeric indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--simple-vertical-numeric-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test('verify simple vertical numeric indicator with formatting', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--simple-vertical-numeric-indicator-with-custom-number-formatting`,
    );
    await makeScreenshotsOverPage(page);
  });

  test('verify simple horizontal numeric indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--simple-horizontal-numeric-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test('verify bar numeric indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--bar-numeric-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test('verify thin gauge indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--thin-gauge-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test('verify thick gauge indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--thick-gauge-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test('verify numeric indicator with string color options', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-string-color-options`,
    );
    await makeScreenshotsOverPage(page);
  });

  test('verify numeric indicator with uniform color options', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-uniform-color-options`,
    );
    await makeScreenshotsOverPage(page);
  });

  test('verify numeric indicator with conditional color options', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-conditional-color-options`,
    );
    await makeScreenshotsOverPage(page);
  });

  test.skip('verify ticker numeric indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-numeric-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test.skip('verify ticker numeric indicator with secondary value', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--ticker-numeric-indicator-with-secondary-value`,
    );
    await makeScreenshotsOverPage(page);
  });

  test.skip('verify ticker gauge indicator', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator`);
    await makeScreenshotsOverPage(page);
  });

  test.skip('verify ticker gauge indicator with color', async ({ page }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator-with-color`);
    await makeScreenshotsOverPage(page);
  });

  test('verify ticker gauge indicator with forced ticker', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator-with-forced-ticker`,
    );
    await makeScreenshotsOverPage(page);
  });

  test('verify numeric indicator with N/A value', async ({ page }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-not-available-value`,
    );
    await makeScreenshotsOverPage(page);
  });
});
