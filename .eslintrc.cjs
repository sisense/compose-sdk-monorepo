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
      excludedFiles: ['**/*.config.{ts,js}', '**/*.workspace.{ts,js}'],
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
            // These rules are modified because they are overly restrictive
            'import/extensions': 'off', // this is disabled as it does not work with TypeScript path aliases
            '@typescript-eslint/no-floating-promises': 'off',
            'max-params': 'off',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-use-before-define': 'warn',
            '@typescript-eslint/no-shadow': 'off',
            '@typescript-eslint/require-await': 'warn',
            complexity: 'off',
            'sonarjs/cognitive-complexity': 'off',
            '@typescript-eslint/no-throw-literal': 'off',
            'no-underscore-dangle': 'off',
            '@typescript-eslint/no-empty-interface': ['error', { allowSingleExtends: true }],
            'max-lines-per-function': ["warn", 400],
            'max-lines': ["warn", 1000],
          },
        },
        {
          files: ['*.{ts,tsx}'],
          plugins: ['eslint-plugin-tsdoc'],
        },
        { files: ['*.{ts,tsx}'], excludedFiles: ['*.d.ts'], rules: { 'no-unused-vars': 'error' } },
        {
          // Disable additional rules for all non-production files
          files: [
            '**/__demo__/**/*',
            '**/*.stories.tsx',
            '**/__mocks__/*.{ts,tsx}',
            '**/__test-helpers__/*.{ts,tsx}',
            '**/test-helpers/*.{ts,tsx}',
            '**/*.test.{ts,tsx}',
          ],
          rules: {
            'sonarjs/no-duplicate-string': 'off',
            'vitest/no-mocks-import': 'off',

            // These are the same rules applied in Sisense's config for Jest tests.
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
            'no-global-assign': ['error', { exceptions: ['window', 'document'] }],
          },
        },
        {
          // Configuration for linting unit tests
          files: ['**/*.test.{ts,tsx}'],
          extends: ['plugin:vitest/recommended'],
          rules: {
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
    },
  ],
};
