import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../../vitest.config.js';

const config: ViteUserConfig = {
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
};

export default mergeConfig(baseConfig, config);
