import { mergeConfig, ViteUserConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

const config: ViteUserConfig = {
  test: {
    environment: 'jsdom',
    coverage: {
      exclude: [
        // temporarily exclude source files until
        // we move the test files from pivot2 over to this package
        'src/**',
        '!src/shared-ui-components/Button/**/*.tsx',
        '!src/shared-ui-components/CheckableList/**/*.tsx',
        '!src/shared-ui-components/DEPRECATED_Checkbox/**/*.tsx',
        '!src/shared-ui-components/DropdownButtonBody/**/*.tsx',
        '!src/shared-ui-components/Input/**/*.tsx',
        '!src/shared-ui-components/Menu/MenuItem/**/*.tsx',
      ],
    },
  },
};

export default mergeConfig(baseConfig, config);
