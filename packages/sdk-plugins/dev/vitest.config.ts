import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../../vitest.config.js';

const config: ViteUserConfig = {
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}', 'vite-plugin/**/*.ts', 'scripts/**/*.ts'],
      exclude: ['src/**/*.test.{ts,tsx}', 'vite-plugin/**/*.test.ts', 'scripts/**/*.test.ts'],
    },
  },
};

export default mergeConfig(baseConfig, config);
