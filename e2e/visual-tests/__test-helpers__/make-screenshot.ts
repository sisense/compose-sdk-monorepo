import { expect, type Locator, type Page } from '@playwright/test';

const SCREENSHOT_FILE_EXTENSION = '.png';
const SCREENSHOT_DEFAILT_NAME = 'asset';
const TEST_ID_ATTRIBUTE = 'data-visual-testid';
const READINESS_DELAY = 0.2 * 1000;
const LOADERS_APPEAR_WAIT_TIMEOUT = 2 * 1000;
const LOADERS_DISAPPEAR_WAIT_TIMEOUT = 20 * 1000;
const LOADERS_STABILITY_WAIT_DURATION = 0.5 * 1000;
// Temporarily extended screenshot generation timeout from 5s to 20s to overcome the issue with slow funnel chart rendering.
// todo: set correct timeout to cover tests over large dashboards with multiple widgets (20+)
const SCREENSHOT_GENERATION_TIMEOUT = 20 * 1000;

export async function makeScreenshot(page: Page, locator: Locator, name?: string) {
  expect(locator).toBeAttached();

  const screenshotName =
    name || (await locator.getAttribute(TEST_ID_ATTRIBUTE)) || SCREENSHOT_DEFAILT_NAME;
  const screenshotFileName = `${screenshotName}${SCREENSHOT_FILE_EXTENSION}`;

  /**
   * Note: Page-based clip-region screenshots were configured instead of locator-based screenshots
   * to solve an alignment problem that was causing image comparison failures.
   */
  const box = await locator.boundingBox();

  await expect(page).toHaveScreenshot([screenshotFileName], {
    clip: box,
    fullPage: true,
    animations: 'disabled',
    timeout: SCREENSHOT_GENERATION_TIMEOUT,
  });
}

export async function makeScreenshots(page: Page, locators: Locator[], name?: string) {
  expect(locators.length > 0).toBeTruthy();

  // sequentially takes screenshots for all the locators
  await locators.reduce(async (acc, locator, index) => {
    await acc;
    const nameWithIndex = name ? `${name}${index}` : undefined;
    const screenshotName =
      nameWithIndex ||
      (await locator.getAttribute(TEST_ID_ATTRIBUTE)) ||
      `${SCREENSHOT_DEFAILT_NAME}${index}`;
    await makeScreenshot(page, locator, screenshotName);
  }, Promise.resolve());
}

/**
 * Automatically makes screenshots over the page elements marked by `TEST_ID_ATTRIBUTE`
 * The value of this attribute will be used as part of the target screenshot name.
 */
export async function makeScreenshotsOverPage(page: Page) {
  await page.waitForSelector(`[${TEST_ID_ATTRIBUTE}]`, {
    state: 'visible',
  });

  await waitForLoadersToDisappear(page);

  await page.waitForTimeout(READINESS_DELAY);

  const locators = await page.locator(`[${TEST_ID_ATTRIBUTE}]`).all();
  await makeScreenshots(page, locators);
}

// Function to wait for all loaders to disappear
async function waitForLoadersToDisappear(page: Page) {
  const loaderSelector = `[${TEST_ID_ATTRIBUTE}] [aria-label="csdk-loading-indicator"],[${TEST_ID_ATTRIBUTE}] [aria-label="csdk-loading-overlay"]`;

  // wait for a loader to appear on the page
  const hasLoader = await waitForFunctionSilent(
    page,
    (selector) => document.querySelector(selector),
    loaderSelector,
    { timeout: LOADERS_APPEAR_WAIT_TIMEOUT }, // silent timeout
  );

  // if no loader appears within the specified timeout, exit the function
  if (!hasLoader) {
    return;
  }

  // wait for all loaders to disappear from the page
  await page.waitForFunction(
    (selector) => !document.querySelector(selector),
    loaderSelector,
    { timeout: LOADERS_DISAPPEAR_WAIT_TIMEOUT }, // failure timeout
  );

  // wait to ensure no new loaders appear after the previous ones disappeared
  const hasNewLoader = await waitForFunctionSilent(
    page,
    (selector) => document.querySelector(selector),
    loaderSelector,
    { timeout: LOADERS_STABILITY_WAIT_DURATION }, // silent timeout
  );

  // if a new loader appears, rerun the function to wait for loaders to disappear again
  if (hasNewLoader) {
    waitForLoadersToDisappear(page);
  }
}

// Silently runs page.waitForFunction(); a timeout will not cause the test to fail.
// Limitation: in case of timeout, the `waitForFunction` will be marked as 'red' in actions list in playwright UI.
async function waitForFunctionSilent(page: Page, ...args) {
  try {
    await page.waitForFunction(...(args as Parameters<Page['waitForFunction']>));
    return true;
  } catch (error) {
    return false;
  }
}
