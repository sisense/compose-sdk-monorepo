import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  test: {
    pool: 'forks', // https://github.com/vitest-dev/vitest/issues/3077
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
