import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

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
  build: {
    sourcemap: mode === 'production' ? false : true,
    lib: {
      name: 'sdk-ui-vue',
      entry: {
        index: resolve(__dirname, './src/lib.ts'),
        ai: resolve(__dirname, './src/ai/index.ts'),
        ...getTranslationEntries(),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['vue'],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
  ],
}));
