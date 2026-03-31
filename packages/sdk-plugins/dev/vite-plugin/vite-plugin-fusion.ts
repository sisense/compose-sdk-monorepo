import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'rollup';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import zipPack from 'vite-plugin-zip-pack';

import {
  bundlePluginFileName,
  distFolder,
  pluginConfigFileName,
  zippedFileName,
} from '../scripts/consts.js';

/**
 * Reads the top-level `plugin.name` from a manifest file (e.g. `src/index.tsx`).
 * Searches only before the `customWidget` block to avoid matching nested name fields.
 */
function readPluginName(manifestPath: string): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = readFileSync(manifestPath, 'utf-8');
  const searchScope = content.includes('customWidget')
    ? content.slice(0, content.indexOf('customWidget'))
    : content;
  const match = searchScope.match(/\bname\s*:\s*['"`]([^'"`\n]+)['"`]/);
  if (!match?.[1]) {
    throw new Error(
      `Sisense Fusion plugin: could not extract "name" from manifest "${manifestPath}". ` +
        `Ensure the manifest exports a WidgetPlugin object with a top-level "name" property.`,
    );
  }
  return match[1];
}

export interface SisenseFusionPluginOptions {
  /** path to plugin manifest */
  manifest: string;
}

/**
 * Vite plugin for Fusion plugin build: writes plugin.json after bundle and packs output into a zip.
 * Use in vite.config when building for Fusion (e.g. build:fusion).
 */
export function sisenseFusionPlugin(options: SisenseFusionPluginOptions): Plugin[] {
  const manifestPathResolved = resolve(process.cwd(), options.manifest);
  if (!existsSync(manifestPathResolved)) {
    throw new Error(
      `Sisense Fusion plugin: manifest file not found at "${manifestPathResolved}" (manifest: "${options.manifest}").`,
    );
  }

  const isFusionMode = process.argv.includes('--fusion');
  const pluginName = readPluginName(manifestPathResolved);
  const manifestPath = `./${options.manifest}`;

  const virtualModuleId = 'virtual:sisense-fusion-vite-plugin-module';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  const fusionFilesPlugin = {
    name: 'sisense-fusion-vite-plugin',
    apply: 'build',

    resolveId(id: string) {
      if (id.includes(virtualModuleId)) {
        return resolvedVirtualModuleId;
      }
      return undefined;
    },

    load(id: string) {
      if (id === resolvedVirtualModuleId) {
        return `import manifest from "${manifestPath}";
        console.log('wrapper for fusion plugins');
        console.log(manifest.name);
        export default manifest`;
      }
      return undefined;
    },

    config(config: unknown, { command }: { command: string; mode: string }) {
      if (command === 'build') {
        return {
          build: {
            lib: {
              entry: isFusionMode ? virtualModuleId : manifestPath,
              name: pluginName,
              formats: [isFusionMode ? 'umd' : 'es'],
              fileName: () => 'main.js',
            },
          },
        };
      }
      return null;
    },

    closeBundle() {
      if (!isFusionMode) {
        return;
      }

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      writeFileSync(
        resolve(resolve(process.cwd(), distFolder), pluginConfigFileName),
        JSON.stringify(
          {
            name: pluginName,
            folderName: pluginName,
            isEnabled: true,
            pluginInfraVersion: 2,
            source: [bundlePluginFileName],
            version: '1.0.0',
            skipCompilation: true,
          },
          null,
          2,
        ),
      );
    },
  };

  const plugins = [cssInjectedByJsPlugin(), fusionFilesPlugin];
  if (isFusionMode) {
    const zipPlugin = zipPack({
      pathPrefix: pluginName,
      outFileName: zippedFileName,
      outDir: distFolder,
    });
    plugins.push(zipPlugin);
  }

  return plugins;
}
