import { mergeConfig, ViteUserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'jsdom',
  },
};

export default mergeConfig(baseConfig, config);
