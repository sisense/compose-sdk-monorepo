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
     * Configuration for linting production source files
     */
    {
      files: ['*.{ts,js,tsx,jsx}'],
      excludedFiles: [
        '**/__mocks__/*.{ts,tsx}',
        '**/__test-helpers__/*.{ts,tsx}',
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
     * Configuration for linting unit tests and test utilities
     */
    {
      files: [
        '**/__mocks__/*.{ts,tsx}',
        '**/__test-helpers__/*.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/test-helpers/*.{ts,tsx}',
      ],
      extends: ['@sisense/eslint-config/typescript/react', 'plugin:vitest/recommended'],
      rules: {
        'sonarjs/no-duplicate-string': 'off',
        'vitest/no-mocks-import': 'off',
        'no-unused-vars': 'error',

        // These are copied over so we continue to extend Sisense's react
        // config, but omit the jest-specific configs.
        'import/no-extraneous-dependencies': 'off',
        'node/no-unpublished-require': 'off',
        'no-console': 'off',
        'no-unused-expressions': 'off',
        'max-classes-per-file': 'off',
        'func-names': ['warn', 'as-needed'],
        'security/detect-object-injection': 'off',
        'jsdoc/require-returns-description': 'off',
        'no-process-exit': 'off',
        'security/detect-child-process': 'off',
        'max-lines-per-function': 'off',
        'max-lines': 'off',
        'no-global-assign': ['error', { exceptions: ['window', 'document'] }], // need to mutate 'document', 'window' during tests

        // These rules from eslint-plugin-vitest are enabled to closely match
        // the rules enabled in the plugin:jest/recommended config.
        'vitest/expect-expect': 'warn',
        'vitest/no-alias-methods': 'error',
        'vitest/no-conditional-expect': 'error',
        'vitest/no-done-callback': 'error',
        'vitest/no-focused-tests': 'error',
        'vitest/no-interpolation-in-snapshots': 'error',
        'vitest/no-standalone-expect': 'error',
        'vitest/no-test-prefixes': 'error',
      },
    },
  ],
};
