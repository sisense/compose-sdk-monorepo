import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [
        'src/lib/components',
        'src/lib/sdk-ui.module.ts',
        'src/ai/lib/components',
        'src/ai/lib/sdk-ai.module.ts',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
