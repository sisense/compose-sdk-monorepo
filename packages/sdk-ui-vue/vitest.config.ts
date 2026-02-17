import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { resolve } from 'node:path';
import { mergeConfig, type ViteUserConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  plugins: [vue() as any, vueJsx() as any],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test-helpers__/setup-vitest.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [
        'src/__test-helpers__',
        'src/**/__mocks__',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/index-typedoc.ts',
        'src/lib.ts',
        '**/*.vue',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
};

export default mergeConfig(baseConfig, config);
