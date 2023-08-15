/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.eslint.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  overrides: [
    /**
      Configuration for linting production source files
    */
    {
      files: ['*.{ts,js,tsx,jsx}'],
      excludedFiles: [
        '**/__mocks__/*.{ts,tsx}',
        '**/__test_helpers__/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/test-helpers/*.{ts,tsx}',
      ],
      extends: ['@sisense/eslint-config/typescript/react'],
      overrides: [
        {
          // https://stackoverflow.com/questions/66773897/react-using-typescript-dont-use-as-a-type
          files: ['*.{tsx,jsx,ts,js}'],
          rules: {
            '@typescript-eslint/ban-types': [
              'error',
              {
                extendDefaults: true,
                types: {
                  '{}': false,
                },
              },
            ],
            'promise/always-return': ['error', { ignoreLastCallback: true }],

            // the following jsdoc rules are disabled as they are interfering with eslint-plugin-tsdoc
            'jsdoc/require-param': 0,
            'jsdoc/check-param-names': 0,
            'jsdoc/check-tag-names': 0,
            'jsdoc/require-returns': 0,
          },
        },
        {
          files: ['*.{ts,tsx}'],
          plugins: ['eslint-plugin-tsdoc'],
        },
        { files: ['*.{ts,tsx}'], excludedFiles: ['*.d.ts'], rules: { 'no-unused-vars': 'error' } },
        {
          files: ['**/__demo__/**/*'],
          rules: {
            'import/no-extraneous-dependencies': 'off', // allow importing devDependencies in demo files
          },
        },
      ],
    },
    /**
      Configuration for linting Jest tests
    */
    {
      files: [
        '**/__mocks__/*.{ts,tsx}',
        '**/__test_helpers__/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/test-helpers/*.{ts,tsx}',
      ],
      extends: ['@sisense/eslint-config/typescript/react-jest'],
      rules: {
        'sonarjs/no-duplicate-string': 'off',
        'jest/no-mocks-import': 'off',
        'no-unused-vars': 'error',
      },
    },
  ],
};
