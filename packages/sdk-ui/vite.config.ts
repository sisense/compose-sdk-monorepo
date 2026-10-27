import react from '@vitejs/plugin-react-swc';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';

// @ts-ignore — plain ESM, no types needed; processed by Vite/esbuild at config load time
import { csdkEnvSwitcher } from '../../scripts/demo-features/env-switcher/vite-plugin.mjs';
import { fixJsxRuntime } from './scripts/vite-plugins/fix-jsx-runtime';
import { replaceReact18Hooks } from './scripts/vite-plugins/replace-react18-hooks';
import { scopeThirdPartyCss } from './scripts/vite-plugins/scope-third-party-css';

/**
 * Discovers translation files and generates Vite entry points.
 * Each .ts file in the external translations directory becomes a separate bundle entry.
 */
const getTranslationEntries = (): Record<string, string> => {
  const translationsDir = resolve(__dirname, 'src/infra/translation/resources/__external__');
  return readdirSync(translationsDir)
    .filter((file) => file.endsWith('.ts'))
    .reduce<Record<string, string>>((entries, file) => {
      const name = file.replace(/\.ts$/, '');
      entries[`translations/${name}`] = resolve(translationsDir, file);
      return entries;
    }, {});
};

/**
 * `build:watch` rebuilds only the runtime code, to try changes in a host quickly: no declaration
 * files and no type check, and `dist` is updated in place instead of being emptied on each rebuild.
 */
const BUILD_WATCH = process.env.BUILD_WATCH === 'true';

/** Entry that carries the package stylesheet; see `src/styles.ts`. */
const stylesEntry = resolve(__dirname, 'src/styles.ts');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    // Only active during `vite serve` (dev mode); library builds ignore it.
    { ...csdkEnvSwitcher(), apply: 'serve' },
    scopeThirdPartyCss(),
    react({
      jsxImportSource: '@emotion/react', // This tells SWC to use Emotion for JSX
    }),
    cssInjectedByJsPlugin({
      topExecutionPriority: false,
      // Only the `styles` entry carries the stylesheet; the styled entries import it
      jsAssetsFilterFunction(outputChunk) {
        return ['styles.js', 'styles.cjs'].includes(outputChunk.fileName);
      },
      useStrictCSP: true,
    }),
    ...(BUILD_WATCH
      ? []
      : [
          dts({
            insertTypesEntry: true,
            tsConfigFilePath:
              mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
          }),
          checker({
            typescript: true,
            overlay: { initialIsOpen: false },
          }),
        ]),
  ],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    allowedHosts: true,
    watch: {
      ignored: [resolve(__dirname, './coverage'), '**/*.test.*'],
    },
  },
  build: {
    emptyOutDir: !BUILD_WATCH,
    sourcemap: mode === 'production' ? false : true,
    target: 'es6',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        query: resolve(__dirname, 'src/modules/query/index.ts'),
        ai: resolve(__dirname, 'src/modules/ai/index.ts'),
        'analytics-composer': resolve(__dirname, 'src/modules/analytics-composer/index.ts'),
        'analytics-composer/node': resolve(
          __dirname,
          'src/modules/analytics-composer/index-node.ts',
        ),
        styles: stylesEntry,
        internal: resolve(__dirname, 'src/modules/internal/index.ts'),
        'sisense-internal': resolve(__dirname, 'src/modules/sisense-internal/index.ts'),
        ...getTranslationEntries(),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      treeshake: {
        preset: 'smallest',
        // `smallest` drops imports without used bindings; keep the side-effect import of `styles`
        moduleSideEffects: (id) => id === stylesEntry,
      },
      external: [
        // React + all submodules
        /^react(?:\/[\w-]+)*$/,
        // React DOM + all submodules
        /^react-dom(?:\/[\w-]+)*$/,
      ],
      plugins: [
        replaceReact18Hooks(),
        // TODO: commented until we have a proper solution for `preact/compat` compatibility
        // fixJsxRuntime()
      ],
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Use modern Sass compiler API (Vite 5.4+)
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}));
