import { resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import checker from 'vite-plugin-checker';
import { fixJsxRuntime } from './scripts/vite-plugins/fix-jsx-runtime';
import { replaceReact18Hooks } from './scripts/vite-plugins/replace-react18-hooks';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      jsxImportSource: '@emotion/react', // This tells SWC to use Emotion for JSX
      plugins: [
        [
          '@swc/plugin-emotion',
          {
            sourceMap: mode !== 'production', // Enable source maps only in development
            autoLabel: 'always', // Add labels for debugging
            labelFormat: '[local]', // Use the component's variable name in class names
          },
        ],
      ],
    }),
    cssInjectedByJsPlugin({
      topExecutionPriority: false,
      jsAssetsFilterFunction(outputChunk) {
        return ['index.js', 'ai.js', 'ai.cjs', 'index.cjs'].includes(outputChunk.fileName);
      },
      useStrictCSP: true,
    }),
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
    checker({
      typescript: true,
      overlay: { initialIsOpen: false },
    }),
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
    sourcemap: mode === 'production' ? false : true,
    target: 'es6',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ai: resolve(__dirname, 'src/ai/index.ts'),
        'analytics-composer': resolve(__dirname, 'src/analytics-composer/index.ts'),
        'analytics-composer/node': resolve(__dirname, 'src/analytics-composer/index-node.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      treeshake: { preset: 'smallest' },
      external: [
        // React + all submodules
        /^react(?:\/[\w-]+)*$/,
        // React DOM + all submodules
        /^react-dom(?:\/[\w-]+)*$/,
        'leaflet',
        'proj4leaflet',
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
    alias: { '@': resolve(__dirname, './src') },
  },
}));
