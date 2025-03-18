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
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      treeshake: { preset: 'smallest' },
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [
        replaceReact18Hooks(),
        // TODO: commented until we have a proper solution for `preact/compat` compatibility
        // fixJsxRuntime()
      ],
    },
  },
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
}));
