/* eslint-disable security/detect-non-literal-fs-filename */
import { access, cp, mkdir, readdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// eslint-disable-next-line @typescript-eslint/naming-convention
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention
const __dirname = path.dirname(__filename);

/**
 * Recursively copy a directory from source to destination
 */
export async function copyDirectory(src: string, dest: string): Promise<void> {
  try {
    await cp(src, dest, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to copy directory from ${src} to ${dest}: ${error}`);
  }
}

/**
 * Check if a directory exists
 */
export async function directoryExists(dirPath: string): Promise<boolean> {
  try {
    await access(dirPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a directory is empty
 *
 * @param dirPath - The directory path to check
 * @returns `true` if the directory is empty, `false` if it contains files or subdirectories
 * @throws Error if the directory doesn't exist or cannot be accessed
 */
export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
  try {
    const entries = await readdir(dirPath);
    return entries.length === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    throw new Error(`Failed to read directory ${dirPath}: ${error}`);
  }
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error}`);
  }
}

/**
 * Resolve the dist root of this package.
 * When compiled, this file is at dist/helpers.js, so __dirname is dist/ directly.
 */
export function getSdkPluginsRoot(): string {
  return __dirname;
}

/**
 * Get the template directory path.
 * Templates are copied to dist/templates/ during build.
 */
export function getTemplatePath(templateName: string): string {
  return path.join(getSdkPluginsRoot(), 'templates', templateName);
}
