#!/usr/bin/env node

/**
 * Cross-platform script to copy selected templates from @sisense/sdk-plugins-templates
 * into this package's dist/templates directory.
 *
 * Copies the following:
 *   - repo/
 *   - widgets/<value>/ for each widget with "embedded": true in widgets.json
 *   - widgets.json (filtered to entries with "embedded": true)
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXCLUDE_PATTERNS = ['node_modules', '.yarn/'];

/**
 * Important hidden files that should always be included
 */
const IMPORTANT_HIDDEN_FILES = [
  '.gitignore',
  '.yarnrc.yml',
  '.npmrc',
  '.editorconfig',
  '.gitattributes',
  '.prettierrc',
  '.prettierignore',
  '.eslintrc.cjs',
];

/**
 * Check if a path should be excluded.
 * Note: Important hidden files are explicitly included and should never be excluded.
 */
function shouldExclude(filePath, basePath) {
  const relativePath = relative(basePath, filePath).replace(/\\/g, '/');

  const fileName = relativePath.split('/').pop() || '';
  if (IMPORTANT_HIDDEN_FILES.includes(fileName)) {
    return false;
  }

  return EXCLUDE_PATTERNS.some((pattern) => relativePath.includes(pattern));
}

/**
 * Recursively copy directory with exclusions
 */
async function copyDirectoryWithExclusions(src, dest, basePath = src) {
  try {
    const entries = await readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (shouldExclude(srcPath, basePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        await mkdir(destPath, { recursive: true });
        await copyDirectoryWithExclusions(srcPath, destPath, basePath);
      } else {
        await cp(srcPath, destPath);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

async function readEmbeddedWidgets(templatesPackageRoot) {
  const srcPath = join(templatesPackageRoot, 'widgets.json');
  const raw = await readFile(srcPath, 'utf8');
  const allWidgets = JSON.parse(raw);
  return allWidgets.filter((w) => w.embedded === true);
}

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  await copyDirectoryWithExclusions(src, dest, src);
}

async function main() {
  const templatesPackageRoot = resolve(__dirname, '../../templates');
  if (!existsSync(templatesPackageRoot)) {
    console.error(`Error: Templates folder not found at "${templatesPackageRoot}"`);
    process.exit(1);
  }
  const distTemplatesDest = resolve(__dirname, '..', 'dist', 'templates');

  try {
    await rm(distTemplatesDest, { recursive: true, force: true });
    await mkdir(distTemplatesDest, { recursive: true });

    const embeddedWidgets = await readEmbeddedWidgets(templatesPackageRoot);

    await copyDir(join(templatesPackageRoot, 'repo'), join(distTemplatesDest, 'repo'));

    for (const widget of embeddedWidgets) {
      await copyDir(
        join(templatesPackageRoot, 'widgets', widget.value),
        join(distTemplatesDest, 'widgets', widget.value),
      );
    }

    await writeFile(
      join(distTemplatesDest, 'widgets.json'),
      JSON.stringify(embeddedWidgets, null, 2) + '\n',
      'utf8',
    );

    console.log(`Copied templates to ${distTemplatesDest}`);
  } catch (error) {
    console.error('Error copying templates:', error);
    process.exit(1);
  }
}

main();
