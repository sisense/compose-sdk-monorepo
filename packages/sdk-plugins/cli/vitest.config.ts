import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    coverage: {
      exclude: [
        'src/__test-helpers__',
        'src/**/__mocks__/**',
        'src/**/*.test.ts',
        // CLI entry point: executes yargs immediately on import, not unit-testable
        'src/cli.ts',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
