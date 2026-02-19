import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'node',
  },
};

export default mergeConfig(baseConfig, config);
