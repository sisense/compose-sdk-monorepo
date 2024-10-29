import { FullConfig } from '@playwright/test';
import { writeToStore } from './cleanup-utils';

export default async function globalSetup(config: FullConfig) {
  const isUpdateScreenshotsMode = config.updateSnapshots === 'all';

  if (isUpdateScreenshotsMode) {
    const startTime = new Date();
    await writeToStore('testRunStartTime', startTime.toISOString());
  }
}
