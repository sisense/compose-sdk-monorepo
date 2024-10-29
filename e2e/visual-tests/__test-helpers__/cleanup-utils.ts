import { type TestInfo } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

const storeFilePath = path.resolve('./visual-tests/store.json');

export async function updateScreenshotModifyTime(screenshotFileName: string, testInfo: TestInfo) {
  const { titlePath, file } = testInfo;
  const title = titlePath.slice(1).join(' ');
  const normalizedTitle = title.replace(/[\s/]+/g, '-');
  const screenshotPath = `${path.dirname(file)}/__screenshots__/${path.basename(
    file,
  )}/${normalizedTitle}_${screenshotFileName}`;

  try {
    await fs.access(screenshotPath);
    const now = new Date();
    try {
      // Update access time (atime) and modification time (mtime) of the screenshot
      await fs.utimes(screenshotPath, now, now);
    } catch (error) {
      console.error(`Error updating access time for screenshot: ${screenshotPath}`, error);
    }
  } catch {
    console.error(`Screenshot not found at path: ${screenshotPath}`);
  }
}

// Function to recursively find all __screenshots__ folders asynchronously
export async function findScreenshotsDirs(directory: string): Promise<string[]> {
  const screenshotsDirs: string[] = [];

  // Read the contents of the directory
  const filesAndDirs = await fs.readdir(directory);

  await Promise.all(
    filesAndDirs.map(async (fileOrDir) => {
      const fullPath = path.join(directory, fileOrDir);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        if (fileOrDir === '__screenshots__') {
          screenshotsDirs.push(fullPath); // Add __screenshots__ folder
        } else {
          // Recursively search in subdirectories
          const subDirs = await findScreenshotsDirs(fullPath);
          screenshotsDirs.push(...subDirs);
        }
      }
    }),
  );

  return screenshotsDirs;
}

// Function to clean up outdated screenshots asynchronously in subdirectories
export async function cleanupOutdatedScreenshots(
  directory: string,
  startTime: Date,
): Promise<void> {
  const filesAndDirs = await fs.readdir(directory);

  await Promise.all(
    filesAndDirs.map(async (fileOrDir) => {
      const fullPath = path.join(directory, fileOrDir);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        // Recursively search for .png files in subdirectories
        await cleanupOutdatedScreenshots(fullPath, startTime);
      } else if (stats.isFile() && path.extname(fullPath) === '.png' && stats.atime < startTime) {
        console.log(`A screenshot is outdated at ${fullPath}, removing it.`);
        await fs.unlink(fullPath); // Remove outdated screenshot
      }
    }),
  );
}

export async function makeScreenshotsCleanup(cutoffDate: Date, rootDir: string) {
  // Find all __screenshots__ directories recursively under the visual folder
  const screenshotsDirs = await findScreenshotsDirs(rootDir);

  // Clean up outdated .png files in each __screenshots__ directory and subdirectories
  await Promise.all([
    screenshotsDirs.map((dir) => {
      cleanupOutdatedScreenshots(dir, cutoffDate);
    }),
  ]);
}

// Function to write data to the JSON store
export async function writeToStore(key: string, value: any): Promise<void> {
  let store: Record<string, any> = {};

  // Check if the store file exists
  try {
    await fs.access(storeFilePath);
    // Read the existing store
    const data = await fs.readFile(storeFilePath, 'utf-8');
    store = JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist, we'll create it when we write
    if (error.code !== 'ENOENT') {
      throw error; // If there's another error, rethrow it
    }
  }

  // Update the store with the new value
  store[key] = value;

  // Write the updated store back to the file
  await fs.writeFile(storeFilePath, JSON.stringify(store, null, 2), 'utf-8');
}

// Function to read data from the JSON store
export async function readFromStore(key: string): Promise<any | undefined> {
  try {
    const data = await fs.readFile(storeFilePath, 'utf-8');
    const store = JSON.parse(data);
    return store[key];
  } catch (error) {
    // If the file doesn't exist, return undefined
    if (error.code === 'ENOENT') {
      return undefined;
    }
    throw error; // Re-throw if there's another error
  }
}

// Function to clear the JSON store
export async function clearStore(): Promise<void> {
  try {
    await fs.unlink(storeFilePath); // Delete the store file
  } catch (error) {
    // If the file doesn't exist, ignore the error
    if (error.code !== 'ENOENT') {
      throw error; // Re-throw if there's another error
    }
  }
}
