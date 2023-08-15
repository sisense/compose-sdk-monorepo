import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@sisense/sdk-common',
      formats: ['es'],
    },
  },
}));
