/* eslint-env node */
// This config mirrors templates/repo/.eslintrc.cjs so that widget source files
// are linted with the same rules they will face inside a generated plugin repo.
// root:true stops ESLint from inheriting monorepo-level rules (e.g. security,
// import, i18next) that are not present in the customer-facing config.
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react'],
  rules: {
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': [
      'error',
      {
        // `paths` matches barrel ids only; gitignore `patterns` would block subpaths too.
        paths: [
          {
            name: 'lodash',
            message: "Use direct subpath imports (e.g. 'lodash/capitalize') instead of the barrel.",
          },
          {
            name: 'lodash-es',
            message:
              "Use direct subpath imports (e.g. 'lodash-es/debounce') instead of the barrel.",
          },
          {
            name: '@mui/material',
            message: "Use direct subpath imports (e.g. '@mui/material/Box') instead of the barrel.",
          },
          {
            name: '@mui/icons-material',
            message:
              "Use direct subpath imports (e.g. '@mui/icons-material/Home') instead of the barrel.",
          },
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
