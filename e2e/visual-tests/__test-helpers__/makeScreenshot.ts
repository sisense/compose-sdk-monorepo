import { expect, type Locator, type Page } from '@playwright/test';

const SCREENSHOT_FILE_EXTENSION = '.png';
const SCREENSHOT_DEFAILT_NAME = 'asset';
const TEST_ID_ATTRIBUTE = 'data-visual-testid';
const READINESS_DELAY = 0.2 * 1000;
const LOADERS_CHECK_DURATION = 1.8 * 1000;
const LOADERS_CHECK_INTERVAL = 100;
const LOADERS_CHECK_TIMEOUT = 10 * 1000;

export async function makeScreenshot(page: Page, locator: Locator, name?: string) {
  expect(locator).toBeAttached();

  const suffix = name || (await locator.getAttribute(TEST_ID_ATTRIBUTE)) || SCREENSHOT_DEFAILT_NAME;

  /**
   * Note: Page-based clip-region screenshots were configured instead of locator-based screenshots
   * to solve an alignment problem that was causing image comparison failures.
   */
  const box = await locator.boundingBox();
  await expect(page).toHaveScreenshot([`${suffix}${SCREENSHOT_FILE_EXTENSION}`], {
    clip: box,
    fullPage: true,
    animations: 'disabled',
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

async function delay(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

// Function to wait for all loaders to disappear
async function waitForLoadersToDisappear(page: Page) {
  let isMinimalCheckDurationReached = false;
  const checkLoaders = async () => {
    await page.waitForFunction(
      (selector) => {
        const targetElements = Array.from(document.querySelectorAll(selector));
        return targetElements.every(
          (element) => !element.querySelector('[aria-label="csdk-loading-overlay"]'),
        );
      },
      `[${TEST_ID_ATTRIBUTE}]`,
      { timeout: LOADERS_CHECK_TIMEOUT },
    );

    if (!isMinimalCheckDurationReached) {
      await delay(LOADERS_CHECK_INTERVAL);
      await checkLoaders();
    }
  };

  await Promise.all([
    delay(LOADERS_CHECK_DURATION).then(() => (isMinimalCheckDurationReached = true)),
    checkLoaders(),
  ]);
}
