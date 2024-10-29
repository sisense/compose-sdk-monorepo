import { FullConfig } from '@playwright/test';
import { clearStore, makeScreenshotsCleanup, readFromStore } from './cleanup-utils';

export default async function globalTeardown(config: FullConfig) {
  const isUpdateScreenshotsMode = config.updateSnapshots === 'all';

  // Exit early if not in "update" mode
  if (!isUpdateScreenshotsMode) return;

  try {
    const testRunStartTime = await readFromStore('testRunStartTime');
    if (!testRunStartTime) {
      console.log('Missing start time of test run');
      await clearStore();
      return;
    }

    const hasFailures = await readFromStore('hasFailedTests');
    if (hasFailures) {
      console.log('Screenshot updates were skipped due to test failures.');
      await clearStore();
      return;
    }

    const startTime = new Date(testRunStartTime);
    const rootDir = config.rootDir;

    await makeScreenshotsCleanup(startTime, rootDir);
  } catch (error) {
    console.error('Error during global teardown:', error);
  } finally {
    await clearStore();
    // Add empty line to prevent missing the last log message due to a Playwright bug
    console.log(' ');
  }
}
