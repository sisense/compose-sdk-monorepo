import { test } from '../__test-helpers__/test-setup';
import { AppsNames, getAppConfig } from '../appsConfig';

const { url } = getAppConfig(AppsNames.REACT_STORYBOOK);

test.describe('indicator', () => {
  test('verify simple vertical numeric indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--simple-vertical-numeric-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify simple vertical numeric indicator with formatting', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--simple-vertical-numeric-indicator-with-custom-number-formatting`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify simple horizontal numeric indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--simple-horizontal-numeric-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify bar numeric indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--bar-numeric-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify thin gauge indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--thin-gauge-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify thick gauge indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--thick-gauge-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify numeric indicator with string color options', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-string-color-options`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify numeric indicator with uniform color options', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-uniform-color-options`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify numeric indicator with conditional color options', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-conditional-color-options`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test.skip('verify ticker numeric indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-numeric-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test.skip('verify ticker numeric indicator with secondary value', async ({
    page,
    testHelper,
  }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--ticker-numeric-indicator-with-secondary-value`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test.skip('verify ticker gauge indicator', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator`);
    await testHelper.makeScreenshotsOverPage();
  });

  test.skip('verify ticker gauge indicator with color', async ({ page, testHelper }) => {
    await page.goto(`${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator-with-color`);
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify ticker gauge indicator with forced ticker', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--ticker-gauge-indicator-with-forced-ticker`,
    );
    await testHelper.makeScreenshotsOverPage();
  });

  test('verify numeric indicator with N/A value', async ({ page, testHelper }) => {
    await page.goto(
      `${url}/iframe.html?id=charts-indicator--numeric-indicator-with-not-available-value`,
    );
    await testHelper.makeScreenshotsOverPage();
  });
});
