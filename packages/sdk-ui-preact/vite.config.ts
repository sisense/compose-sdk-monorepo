import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import preact from '@preact/preset-vite';

/**
 * Discovers translation files and generates Vite entry points.
 * Each .ts file in the external translations directory becomes a separate bundle entry.
 */
const getTranslationEntries = (): Record<string, string> => {
  const translationsDir = resolve(__dirname, 'src/translation/__external__');
  return readdirSync(translationsDir)
    .filter((file) => file.endsWith('.ts'))
    .reduce<Record<string, string>>((entries, file) => {
      const name = file.replace(/\.ts$/, '');
      entries[`translations/${name}`] = resolve(translationsDir, file);
      return entries;
    }, {});
};

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
        ...getTranslationEntries(),
      },
      name: '@sisense/sdk-ui-preact',
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
