import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// @ts-ignore — plain ESM, no types needed; processed by Vite/esbuild at config load time
import { csdkEnvSwitcher } from '../../scripts/demo-features/env-switcher/vite-plugin.mjs';
import { scopeThirdPartyCss } from './scripts/vite-plugins/scope-third-party-css';

/**
 * Vite config for building the __demo__ app as a deployable static site.
 *
 * Output lands in `public/` so GitLab Pages can serve it directly.
 * Everything inside `public/` is gitignored except `vite.svg` (the favicon).
 *
 * Sisense credentials are read from `VITE_APP_*` environment variables and
 * baked into the bundle by Vite at build time.  For local work, populate them
 * in `.env.local`.  For CI / GitLab Pages, set them as masked CI/CD variables.
 *
 * Set DEMO_BASE_PATH to the full base path for this specific app when deploying
 * to a subpath, e.g.:
 *   DEMO_BASE_PATH=/compose-sdk-monorepo/mr-42/react/ yarn build:demo
 *
 * When building via `yarn build:demo` at the monorepo root, DEMO_BASE_PATH is
 * computed and injected by the root build:demo:react script. Defaults to '/'.
 *
 * Intentionally excludes library-only plugins (dts, cssInjectedByJsPlugin,
 * replaceReact18Hooks) and lib/rollup configuration — this is an app build,
 * not a library build.
 */
export default defineConfig({
  plugins: [csdkEnvSwitcher(), scopeThirdPartyCss(), react({ jsxImportSource: '@emotion/react' })],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  publicDir: false,
  base: process.env.DEMO_BASE_PATH ?? '/',
  build: {
    outDir: process.env.DEMO_OUT_DIR ?? 'public',
    // Keep false so the tracked vite.svg favicon is not deleted on local rebuilds.
    // Safe in CI because the runner workspace is always fresh.
    emptyOutDir: false,
    sourcemap: false,
    // The demo bundle is large by nature (all demo pages + SDK source in one
    // app). Suppress the default 500 kB warning that doesn't apply here.
    chunkSizeWarningLimit: 15000,
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
