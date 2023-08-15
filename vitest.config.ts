import { UserConfig } from 'vitest/config';

const config: UserConfig = {
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      all: true,
      provider: 'istanbul',
      include: ['src'],
    },
  },
};

export default config;
