#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

import { distFolder, pluginConfigFileName, zippedFileName } from './consts.js';

interface PluginConfig {
  name: string;
}

export async function readPluginConfig(distPath: string): Promise<PluginConfig> {
  const configPath = resolve(distPath, pluginConfigFileName);
  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as PluginConfig;
  } catch {
    throw new Error(`Could not read "${configPath}". Run "build:fusion" before deploying.`);
  }
}

export async function run() {
  const buildDistPath = resolve(process.cwd(), distFolder);
  const zipFilePath = resolve(buildDistPath, `./${zippedFileName}`);

  const env = loadEnv('development', process.cwd(), '');

  const { VITE_APP_SISENSE_URL: url, VITE_APP_SISENSE_TOKEN: token } = env;

  const { name: pluginName } = await readPluginConfig(buildDistPath);

  if (!url || !token || !pluginName) {
    console.error(
      'Required variables VITE_APP_SISENSE_URL and VITE_APP_SISENSE_TOKEN are not defined in .env.local. Aborting deployment.',
    );
    process.exit(1);
  }

  console.log(`Attempting deletion of "${pluginName}" plugin...`);

  const pluginId = `${pluginName}/${pluginName}`;

  const deleteResponse = await fetch(
    `${url.replace(/\/$/, '')}/api/v1/plugins/${encodeURIComponent(pluginId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  console.log('Deletion status', deleteResponse.status);

  console.log(`Uploading zip archive of "${pluginName}" plugin...`);

  const formData = new FormData();
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  formData.append(
    'plugins',
    new Blob([new Uint8Array(await readFile(zipFilePath))]),
    zippedFileName,
  );

  const response = await fetch(`${url.replace(/\/$/, '')}/api/v1/plugins/import?overwrite=false`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  console.log('Import status', response.status);
  console.log('Import response', await response.text());
}

// Only auto-execute when run directly as a script, not when imported by tests.
// realpathSync resolves symlinks (Yarn workspaces symlink node_modules packages).
const isMain =
  typeof process.argv[1] !== 'undefined' &&
  realpathSync(fileURLToPath(import.meta.url)) === realpathSync(resolve(process.argv[1]));

if (isMain) {
  run().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
