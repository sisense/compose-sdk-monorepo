import { TestInfo, type Locator, type Page } from '@playwright/test';
import { makeScreenshot, makeScreenshots, makeScreenshotsOverPage } from './make-screenshot';

// Factory function to create a screenshot helper
export function createScreenshotTestHelper(page: Page, testInfo: TestInfo) {
  return {
    makeScreenshot: (locator: Locator, name?: string) =>
      makeScreenshot(page, testInfo, locator, name),
    makeScreenshots: (locators: Locator[], name?: string) =>
      makeScreenshots(page, testInfo, locators, name),
    makeScreenshotsOverPage: () => makeScreenshotsOverPage(page, testInfo),
  };
}
