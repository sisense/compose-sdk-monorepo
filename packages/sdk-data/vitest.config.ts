import { mergeConfig, ViteUserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        // from modern-analytics-filters
        'src/dimensional-model/filters/utils/filter-types-util.ts',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
