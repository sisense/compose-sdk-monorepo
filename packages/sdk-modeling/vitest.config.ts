import { mergeConfig, ViteUserConfig } from 'vitest/config';

import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'node',
    // Several tests invoke the TypeScript compiler in-memory (writer, compile-ts-code,
    // format-code). Under istanbul coverage instrumentation on shared CI runners this can
    // exceed Vitest's 5s default and flake, so allow more headroom.
    testTimeout: 30000,
  },
};

export default mergeConfig(baseConfig, config);
