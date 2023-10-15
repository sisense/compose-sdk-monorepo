import { mergeConfig, UserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: UserConfig = {
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test-helpers__/setup-vitest.ts'],
    // The next few lines are based off of https://github.com/wobsoriano/vitest-canvas-mock#usage.
    deps: {
      inline: ['vitest-canvas-mock'],
    },
    threads: false,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [
        'src/__demo__',
        'src/__exclude__',
        'src/__stories__',
        'src/__test-helpers__',
        'src/**/__mocks__/**',
        'src/@types',
        'src/widgets/common/drilldown-breadcrumbs',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
