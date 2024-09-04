import { test } from '@playwright/test';
import { AppsNames, getAppConfig } from '../appsConfig';
import { makeScreenshotsOverPage } from '../__test-helpers__/make-screenshot';

const TEST_STEP_AVARAGE_TIMEOUT = 20 * 1000;

const { url } = getAppConfig(AppsNames.REACT_LOCAL_DEMO);

test('verify test suites in light mode', async ({ page }) => {
  await page.goto(url);
  await page.locator('span', { hasText: 'TestSuiteDashboards' }).click();
  await page.locator('#selectDashboard').waitFor();
  await page.locator('#selectThemeOrigin').selectOption({ label: 'Light (default)' });

  const dashboards = await page.$$eval('#selectDashboard option', (elements) =>
    elements.map((el) => el.textContent.trim()).filter((title) => title),
  );

  test.setTimeout((dashboards.length || 1) * TEST_STEP_AVARAGE_TIMEOUT);

  for (const dashboard of dashboards) {
    // temporary skips funnel chart as it is unstable due to performance issue
    if (dashboard === 'Funnel Chart') {
      continue;
    }
    await test.step(`check ${dashboard}`, async () => {
      page.locator('#selectDashboard').selectOption({ label: dashboard });

      await makeScreenshotsOverPage(page);
    });
  }
});

test('verify test suites in dark mode', async ({ page }) => {
  await page.goto(url);
  await page.locator('span', { hasText: 'TestSuiteDashboards' }).click();
  await page.locator('#selectDashboard').waitFor();
  await page.locator('#selectThemeOrigin').selectOption({ label: 'Dark (default)' });

  const dashboards = await page.$$eval('#selectDashboard option', (elements) =>
    elements.map((el) => el.textContent.trim()).filter((title) => title),
  );

  test.setTimeout((dashboards.length || 1) * TEST_STEP_AVARAGE_TIMEOUT);

  for (const dashboard of dashboards) {
    // temporary skips funnel chart as it is unstable due to performance issue
    if (dashboard === 'Funnel Chart') {
      continue;
    }
    await test.step(`check ${dashboard}`, async () => {
      page.locator('#selectDashboard').selectOption({ label: dashboard });

      await makeScreenshotsOverPage(page);
    });
  }
});
