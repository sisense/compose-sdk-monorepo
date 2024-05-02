import { resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import checker from 'vite-plugin-checker';
import { OutputChunk } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: false,
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk: OutputChunk) {
        return ['index.js'].includes(outputChunk.fileName);
      },
    }),
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
    checker({
      typescript: true,
      overlay: {
        initialIsOpen: false,
      },
    }),
  ],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    sourcemap: mode !== 'production',
    target: 'es6',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      treeshake: {
        preset: 'smallest',
      },
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    commonjsOptions: {
      // true: wrap all CommonJS files in functions which are executed when they are required for the first time, preserving NodeJS semantics.
      // needed for socket.io-client 2.5.0
      strictRequires: true,
    },
  },
}));
