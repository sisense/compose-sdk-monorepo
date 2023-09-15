import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      all: true,
      provider: 'istanbul',
      include: ['src'],
      exclude: ['src/__test-helpers__', 'src/**/__mocks__/**'],
    },
  },
};

export default config;
