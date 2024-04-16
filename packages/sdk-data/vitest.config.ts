import { mergeConfig, UserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: UserConfig = {
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        // from modern-analytics-filters
        'src/dimensional-model/filters/utils/modern-analytics-filters/**',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
