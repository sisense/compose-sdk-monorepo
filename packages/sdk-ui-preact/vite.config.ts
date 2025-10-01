import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    preact(),
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ai: resolve(__dirname, 'src/ai/index.ts'),
      },
      name: '@ethings-os/sdk-ui-preact',
      formats: ['es', 'cjs'],
    },
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react-dom/client': 'preact/compat',
      'react-dom/server': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
}));
