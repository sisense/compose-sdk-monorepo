import { mergeConfig, UserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: UserConfig = {
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [],
    },
  },
};

export default mergeConfig(baseConfig, config);
