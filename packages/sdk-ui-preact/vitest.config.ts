import { preact } from '@preact/preset-vite';
import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  plugins: [preact() as any],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test-helpers__/setup-vitest.ts'],
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    coverage: {
      exclude: [
        'src/__demo__',
        'src/__test-helpers__',
        'src/**/__mocks__',
        '**/*.test.tsx',
        '**/*.test.ts',
      ],
    },
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react-dom/client': 'preact/compat',
      'react-dom/server': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
};

export default mergeConfig(baseConfig, config);
