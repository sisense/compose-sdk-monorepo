/**
 * Vite plugin: injects the CSDK env-switcher into the HTML at build time.
 *
 * The implementation lives in ./env-switcher.js (single source of truth).
 * This plugin reads that file and injects it as an inline <script> before </body>
 * — no external HTTP request, works identically in dev (vite serve) and production
 * builds.
 *
 * Usage in any vite.config.ts / vite.demo.config.ts:
 *
 *   import { csdkEnvSwitcher } from '../../scripts/demo-features/env-switcher/vite-plugin.mjs';
 *
 *   export default defineConfig({
 *     plugins: [csdkEnvSwitcher(), ...],
 *   });
 *
 * To restrict to dev only (e.g. when the same config is used for a library build):
 *
 *   plugins: [{ ...csdkEnvSwitcher(), apply: 'serve' }, ...],
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

/**
 * Returns a Vite plugin that injects env-switcher.js inline before </body>.
 *
 * @returns {import('vite').Plugin}
 */
export function csdkEnvSwitcher() {
  const script = readFileSync(resolve(dir, 'env-switcher.js'), 'utf8');
  let viteEnv = {};
  return {
    name: 'csdk-env-switcher',
    configResolved(config) {
      viteEnv = config.env;
    },
    transformIndexHtml: () => {
      if (viteEnv.VITE_APP_DISABLE_DEMO_BAR === 'true') return [];
      return [{ tag: 'script', attrs: {}, children: script, injectTo: 'body' }];
    },
  };
}
