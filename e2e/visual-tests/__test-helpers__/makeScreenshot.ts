import { expect, type Locator, type Page } from '@playwright/test';

const SCREENSHOT_FILE_EXTENSION = '.png';
const SCREENSHOT_DEFAILT_NAME = 'asset';
const TEST_ID_ATTRIBUTE = 'data-visual-testid';
const INITIAL_RENDER_DELAY = 1000;
const ANIMATION_DELAY = 1000;

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
  await page.waitForTimeout(INITIAL_RENDER_DELAY);

  // wait all spinners to disappear for target elements
  const loaders = page.locator(`[${TEST_ID_ATTRIBUTE}] [area-label="csdk-loading-overlay"]`);
  expect(loaders).toHaveCount(0, { timeout: 20 * 1000 });

  await page.waitForTimeout(ANIMATION_DELAY);

  const locators = await page.locator(`[${TEST_ID_ATTRIBUTE}]`).all();
  await makeScreenshots(page, locators);
}
