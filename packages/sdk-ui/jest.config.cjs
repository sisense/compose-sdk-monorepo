const baseConfig = require('../../jest.config.cjs');

/** @type {import('ts-jest/dist/types').JestConfigWithTsJest} */
const config = {
  ...baseConfig,
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['./src/__test_helpers__/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // override the base config to exclude additional directories
  modulePathIgnorePatterns: [
    '<rootDir>/dist',
    '<rootDir>/src/__test_helpers__',
    '<rootDir>/src/__demo__',
    '<rootDir>/src/__stories__',
    '<rootDir>/src/@types',
  ],
};

module.exports = config;
