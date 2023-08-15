const esModules = ['@sisense/task-manager', 'uuid'].join('|');

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/dist', '<rootDir>/src/__test_helpers__'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest'],
    '^.+\\.jsx?$': [
      'babel-jest',
      {
        presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
      },
    ],
  },
  transformIgnorePatterns: [`/node_modules/(?!(${esModules})/)`],
  // Workaround to get Jest to resolve import paths that end in .js:
  // https://kulshekhar.github.io/ts-jest/docs/guides/esm-support/#manual-configuration
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  // collect coverage in files with tests as well as files without tests
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};

module.exports = config;
