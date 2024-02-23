import { mergeConfig, UserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: UserConfig = {
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        // temporarily exclude source files until
        // we move the test files from pivot2 over to this package
        'src/**',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
