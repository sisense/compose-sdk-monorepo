import { test as baseTest } from '@playwright/test';
import { createScreenshotTestHelper } from './test-helper';
import { writeToStore } from './cleanup-utils';

// Define a new fixture that adds 'testHelper' to the test context
export const test = baseTest.extend<{
  testHelper: ReturnType<typeof createScreenshotTestHelper>;
}>({
  testHelper: async ({ page }, use, testInfo) => {
    const testHelper = createScreenshotTestHelper(page, testInfo);
    await use(testHelper);
  },
});

test.afterEach(async ({}, testInfo) => {
  const isUpdateScreenshotsMode = testInfo.config.updateSnapshots === 'all';

  if (isUpdateScreenshotsMode && testInfo.status === 'failed') {
    await writeToStore('hasFailedTests', true);
  }
});
