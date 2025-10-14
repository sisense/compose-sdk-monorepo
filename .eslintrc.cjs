/** @type { import("eslint").Linter.Config } */
const path = require('path');
const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = path.join(__dirname, 'eslint-rules');

module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.eslint.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['rulesdir'],
  overrides: [
    /**
     * Configuration for linting production source files
     */
    {
      files: ['*.{ts,js,tsx,jsx}'],
      excludedFiles: ['**/*.config.{ts,js}', '**/*.workspace.{ts,js}', 'eslint-rules/**/*'],
      extends: ['@sisense/eslint-config/typescript/react', 'plugin:i18next/recommended'],
      rules: {
        // Import sorting is now handled by Prettier
      },
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
            'max-lines-per-function': ['warn', 400],
            'max-lines': ['warn', 1000],
            'no-global-assign': 'error',
            'no-extend-native': 'error',
            'no-implicit-globals': 'error',
            // change jsx-text-only to jsx-only for deeper analysis
            'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
            'rulesdir/opacity-zero-needs-focus-visible': 'error',
            'rulesdir/no-lodash-whole-import': 'error',
            'rulesdir/no-mui-barrel-import': 'error',
            'rulesdir/prefer-custom-popover': 'error',
          },
        },
        {
          // Disable the translation rule for files in the /examples folder
          files: ['examples/**/*'],
          rules: {
            'i18next/no-literal-string': 'off',
          },
        },
        {
          files: ['*.{ts,tsx}'],
          plugins: ['eslint-plugin-tsdoc'],
        },
        { files: ['*.{ts,tsx}'], excludedFiles: ['*.d.ts'], rules: { 'no-unused-vars': 'error' } },
        {
          files: ['*.tsx'],
          rules: {
            '@typescript-eslint/no-use-before-define': [
              'warn',
              {
                functions: false,
                classes: true,
                variables: false,
                typedefs: false,
              },
            ],
          },
        },
        {
          // Disable additional rules for all non-production files
          files: [
            '**/__demo__/**/*',
            '**/*.stories.tsx',
            '**/__mocks__/*.{ts,tsx}',
            '**/__test-helpers__/*.{ts,tsx}',
            '**/test-helpers/*.{ts,tsx}',
            '**/*.test.{ts,tsx}',
            'e2e/**/*.spec.{ts,tsx,js,jsx}',
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
            'i18next/no-literal-string': 'off',
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
        {
          // Enforce extensions for relative imports in sdk-analytics-composer
          // This ensures that module resolution will work when this package is
          // imported in a Node environment.
          files: ['packages/sdk-ui/analytics-composer/**/*.{ts,tsx}'],
          rules: {
            'import/extensions': ['error', 'ignorePackages'],
          },
        },
      ],
    },
  ],
};
