/* eslint-env node */
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
  plugins: ['react-refresh', '@typescript-eslint', 'react'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/prop-types': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'lodash',
            message:
              "Use direct subpath imports (e.g. 'lodash/capitalize') instead of the barrel.",
          },
          {
            name: 'lodash-es',
            message:
              "Use direct subpath imports (e.g. 'lodash-es/debounce') instead of the barrel.",
          },
          {
            name: '@mui/material',
            message:
              "Use direct subpath imports (e.g. '@mui/material/Box') instead of the barrel.",
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
