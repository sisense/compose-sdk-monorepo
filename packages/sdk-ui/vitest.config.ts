import { resolve } from 'node:path';
import { mergeConfig, ViteUserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test-helpers__/setup-vitest.ts'],
    // The next few lines are based off of https://github.com/wobsoriano/vitest-canvas-mock#usage.
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [
        'src/__demo__',
        'src/__exclude__',
        'src/__test-helpers__',
        'src/**/__mocks__',
        'src/__stories__/template.tsx',
        '**/*.stories.tsx',
        '**/*.test.tsx',
        '**/*.test.ts',
        'src/@types',
        'src/widgets/common/drilldown-breadcrumbs',
        'src/charts/indicator/chart/*', // legacy indicator's code, copy-pasted from PWC
        'src/utils/__development-utils__',
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
