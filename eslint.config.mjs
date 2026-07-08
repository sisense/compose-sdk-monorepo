import js from '@eslint/js';
import vitest from '@vitest/eslint-plugin';
import prettier from 'eslint-config-prettier';
import i18next from 'eslint-plugin-i18next';
import importPlugin from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import promise from 'eslint-plugin-promise';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import sonarjs from 'eslint-plugin-sonarjs';
import tsdoc from 'eslint-plugin-tsdoc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import rulesdir from './eslint-rules/index.js';

// No-op rule used to keep a few `@typescript-eslint` rule ids resolvable that were
// renamed/removed in typescript-eslint v8 but are still referenced by `eslint-disable`
// comments in source (e.g. `ban-types` -> `no-empty-object-type`, `no-throw-literal`
// -> `only-throw-error`). Registering the old ids (left disabled) avoids ESLint 9's
// "Definition for rule ... was not found" error without touching source.
const noopRule = { meta: { schema: [] }, create: () => ({}) };
const typescriptEslintPlugin = {
  ...tseslint.plugin,
  rules: {
    ...tseslint.plugin.rules,
    'ban-types': noopRule,
    'no-throw-literal': noopRule,
  },
};

/**
 * Flat ESLint config for the monorepo (ESLint 9).
 *
 * This config is a behaviour-preserving port of the previous eslintrc setup that
 * extended `@sisense/eslint-config/typescript/react`. The shared (airbnb-based,
 * ESLint 7/8-only) config was inlined here and the rule set frozen to match the
 * exact effective rules captured from ESLint 8, so the migration introduces no
 * new lint findings. A handful of `@typescript-eslint` rules were renamed in v8:
 *   - `ban-types`          -> `no-empty-object-type` + `no-unsafe-function-type` + `no-wrapper-object-types`
 *   - `no-empty-interface` -> folded into `no-empty-object-type`
 *   - `no-loss-of-precision` -> core `no-loss-of-precision`
 *   - `no-var-requires`    -> `no-require-imports`
 *   - `lines-between-class-members` -> removed (stylistic; handled by Prettier)
 */

/** Production source rules — port of the shared config + root-level overrides. */
const baseRules = {
  '@typescript-eslint/adjacent-overload-signatures': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 now inspects `for await...of`, flagging
  // code that was clean under the previous version. Kept visible for later cleanup.
  '@typescript-eslint/await-thenable': ['warn'],
  '@typescript-eslint/ban-ts-comment': ['error'],
  '@typescript-eslint/default-param-last': ['error'],
  '@typescript-eslint/dot-notation': [
    'error',
    {
      allowKeywords: true,
      allowPattern: '',
      allowPrivateClassPropertyAccess: false,
      allowProtectedClassPropertyAccess: false,
      allowIndexSignaturePropertyAccess: false,
    },
  ],
  '@typescript-eslint/naming-convention': [
    'error',
    { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'] },
    { selector: 'function', format: ['camelCase', 'PascalCase'] },
    { selector: 'typeLike', format: ['PascalCase'] },
  ],
  '@typescript-eslint/no-array-constructor': ['error'],
  '@typescript-eslint/no-dupe-class-members': ['error'],
  '@typescript-eslint/no-empty-function': [
    'error',
    { allow: ['arrowFunctions', 'functions', 'methods'] },
  ],
  // Replaces the previous `ban-types` with `{ '{}': false }` (allow the `{}` type)
  // and `no-empty-interface` with `allowSingleExtends: true`.
  '@typescript-eslint/no-empty-object-type': [
    'error',
    { allowInterfaces: 'with-single-extends', allowObjectTypes: 'always' },
  ],
  '@typescript-eslint/no-unsafe-function-type': ['error'],
  '@typescript-eslint/no-wrapper-object-types': ['error'],
  '@typescript-eslint/no-explicit-any': ['warn'],
  '@typescript-eslint/no-extra-non-null-assertion': ['error'],
  '@typescript-eslint/no-for-in-array': ['error'],
  '@typescript-eslint/no-implied-eval': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 is stricter here than the prior version.
  '@typescript-eslint/no-inferrable-types': ['warn'],
  '@typescript-eslint/no-loop-func': ['error'],
  '@typescript-eslint/no-misused-new': ['error'],
  '@typescript-eslint/no-misused-promises': ['error'],
  '@typescript-eslint/no-namespace': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 flags cases the prior version did not.
  '@typescript-eslint/no-non-null-asserted-optional-chain': ['warn'],
  '@typescript-eslint/no-non-null-assertion': ['warn'],
  '@typescript-eslint/no-redeclare': ['error'],
  '@typescript-eslint/no-require-imports': ['error'],
  '@typescript-eslint/no-this-alias': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 added the "contextually unnecessary"
  // check (and fuller type resolution surfaces more cases), flagging ~600 assertions
  // that were clean under the previous version. Kept visible for incremental cleanup.
  '@typescript-eslint/no-unnecessary-type-assertion': ['warn'],
  '@typescript-eslint/no-unnecessary-type-constraint': ['error'],
  '@typescript-eslint/no-unused-expressions': [
    'error',
    {
      allowShortCircuit: false,
      allowTernary: false,
      allowTaggedTemplates: false,
      enforceForJSX: false,
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'warn',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
  ],
  '@typescript-eslint/no-use-before-define': ['warn', 'nofunc'],
  '@typescript-eslint/no-useless-constructor': ['error'],
  '@typescript-eslint/prefer-as-const': ['error'],
  '@typescript-eslint/prefer-namespace-keyword': ['error'],
  '@typescript-eslint/require-await': ['warn'],
  '@typescript-eslint/restrict-plus-operands': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 changed return-await's default semantics.
  '@typescript-eslint/return-await': ['warn', 'in-try-catch'],
  '@typescript-eslint/triple-slash-reference': ['error'],
  // Downgraded to 'warn': typescript-eslint v8 flags unbound methods the prior version did not.
  '@typescript-eslint/unbound-method': ['warn'],
  'i18next/no-literal-string': ['error', { mode: 'jsx-text-only' }],
  'import/no-extraneous-dependencies': [
    'error',
    {
      // Test files may import devDependencies. (Build-tool config files — vite/vitest
      // etc. — are globally ignored, so they don't need listing here.)
      devDependencies: [
        'test/**',
        'tests/**',
        'spec/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'test.{js,jsx}',
        'test.{ts,tsx}',
        'test-*.{js,jsx}',
        'test-*.{ts,tsx}',
        '**/*{.,_}{test,spec}.{js,jsx}',
        '**/*{.,_}{test,spec}.{ts,tsx}',
      ],
      optionalDependencies: false,
    },
  ],
  'jsdoc/check-access': ['warn'],
  'jsdoc/check-alignment': ['warn'],
  'jsdoc/check-property-names': ['warn'],
  'jsdoc/check-types': ['warn'],
  'jsdoc/check-values': ['warn'],
  'jsdoc/empty-tags': ['warn'],
  'jsdoc/implements-on-classes': ['warn'],
  'jsdoc/multiline-blocks': ['warn'],
  'jsdoc/no-multi-asterisks': ['warn'],
  'jsdoc/no-undefined-types': ['warn'],
  'jsdoc/require-param-description': ['warn'],
  'jsdoc/require-param-name': ['warn'],
  'jsdoc/require-property': ['warn'],
  'jsdoc/require-property-description': ['warn'],
  'jsdoc/require-property-name': ['warn'],
  'jsdoc/require-property-type': ['warn'],
  'jsdoc/require-returns-check': ['warn'],
  'jsdoc/require-returns-description': ['warn'],
  'jsdoc/require-yields': ['warn'],
  'jsdoc/require-yields-check': ['warn'],
  'jsdoc/tag-lines': ['warn'],
  'jsdoc/valid-types': ['warn'],
  'max-depth': ['error', 3],
  'max-lines': ['warn', 1000],
  'max-lines-per-function': ['warn', 400],
  // Core `no-*` rules that duplicate `js.configs.recommended` at the same severity are
  // inherited from it (applied globally via the `recommended` spread) and are no longer
  // re-listed here. Only rules that are NOT in the recommended set, or that intentionally
  // deviate from its severity, remain below.
  'no-extend-native': ['error'],
  'no-implicit-globals': ['error'],
  'no-inner-declarations': ['error'],
  // Downgraded to 'warn' (recommended sets 'error'): core no-loss-of-precision (mapped from
  // the removed TS rule) flags generated mock data that the prior TS rule did not.
  'no-loss-of-precision': ['warn'],
  'no-var': ['error'],
  // Core no-unused-vars is disabled on TS code per typescript-eslint guidance; the
  // type-aware `@typescript-eslint/no-unused-vars` (above) supersedes it. The previous
  // config enabled the core rule too, but with the v8 parser it double-reports and
  // diverges on type-only usage / underscore args, so it is turned off here.
  'no-unused-vars': ['off'],
  'prefer-const': ['error'],
  'prefer-rest-params': ['error'],
  'prefer-spread': ['error'],
  // Full eslint-plugin-promise recommended set — identical to the previous explicit list
  // (its extra `no-native`/`avoid-new` rules are 'off').
  ...promise.configs.recommended.rules,
  // Recommended sets this without options; keep the frozen `ignoreLastCallback` behaviour.
  'promise/always-return': ['error', { ignoreLastCallback: true }],
  'react-hooks/exhaustive-deps': ['error'],
  'react-hooks/rules-of-hooks': ['error'],
  'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
  'rulesdir/no-lodash-whole-import': ['error'],
  'rulesdir/no-mui-barrel-import': ['error'],
  'rulesdir/opacity-zero-needs-focus-visible': ['error'],
  'rulesdir/prefer-custom-popover': ['error'],
  // Full eslint-plugin-security recommended set — all 14 `detect-*` rules at 'warn',
  // byte-for-byte identical to the previous explicit list.
  ...security.configs.recommended.rules,
  // Full eslint-plugin-sonarjs recommended set. Matches the previous explicit list plus one
  // newly-adopted rule, `no-inverted-boolean-check` (its `cognitive-complexity` and
  // `elseif-without-else` rules are 'off').
  ...sonarjs.configs.recommended.rules,
};

/**
 * Industry-standard React + TypeScript baseline (flat config), built from the maintained
 * `recommended` presets — `@eslint/js`, `typescript-eslint` (non-type-checked), `eslint-plugin-react`
 * (+ jsx-runtime), and `eslint-plugin-react-hooks` — plus Prettier and the lodash/MUI barrel
 * restriction. It is standalone and non-type-checked, so a separate project (e.g. a generated SDK
 * plugin) can adopt it directly; it mirrors the config shipped in the plugin repo template.
 *
 * This is intentionally a clean "what good looks like" baseline and is NOT what the monorepo
 * enforces today — the default export below is the migration's frozen rule set, which is stricter
 * and broader (typed linting, sonarjs/security/jsdoc/i18next, the `rulesdir/*` custom rules, …).
 * Converging the real config onto this baseline is the "adopt maintained presets" follow-up; until
 * then `recommended` serves as the target and as the seed for generating a plugin's config.
 */
export const recommended = [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.node, ...globals.browser },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      react,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...typescriptEslintPlugin.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lodash', message: "Use direct subpath imports (e.g. 'lodash/capitalize')." },
            {
              name: 'lodash-es',
              message: "Use direct subpath imports (e.g. 'lodash-es/debounce').",
            },
            {
              name: '@mui/material',
              message: "Use direct subpath imports (e.g. '@mui/material/Box').",
            },
            {
              name: '@mui/icons-material',
              message: "Use direct subpath imports (e.g. '@mui/icons-material/Home').",
            },
          ],
        },
      ],
    },
  },
  {
    // TypeScript supersedes these core rules (the compiler reports undefined identifiers, and the
    // `@typescript-eslint/*` variants handle unused vars), so disable them for TS — exactly what
    // typescript-eslint's `eslint-recommended` layer does. Without this, `no-undef` mass-false-fires
    // on every type/global reference.
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-redeclare': 'off',
      'no-dupe-class-members': 'off',
    },
  },
  prettier,
];

/** Vitest rules for unit tests — frozen to the previous effective set. */
const vitestTestRules = {
  'vitest/expect-expect': ['warn'],
  'vitest/no-alias-methods': ['error'],
  'vitest/no-commented-out-tests': ['error'],
  'vitest/no-conditional-expect': ['error'],
  'vitest/no-done-callback': ['error'],
  'vitest/no-focused-tests': ['error'],
  'vitest/no-identical-title': ['error'],
  'vitest/no-interpolation-in-snapshots': ['error'],
  'vitest/no-mocks-import': ['off'],
  'vitest/no-standalone-expect': ['error'],
  'vitest/no-test-prefixes': ['error'],
  'vitest/prefer-to-be': ['error'],
  'vitest/valid-describe-callback': ['error'],
  'vitest/valid-expect': ['error'],
  'vitest/valid-title': ['error'],
};

/** Non-production files (demos, stories, mocks, test helpers, tests, e2e specs). */
const nonProductionFiles = [
  '**/__demo__/**/*',
  '**/*.stories.tsx',
  '**/__mocks__/**/*.{ts,tsx}',
  '**/__test-helpers__/**/*.{ts,tsx}',
  '**/test-helpers/*.{ts,tsx}',
  '**/*.test.{ts,tsx}',
  'e2e/**/*.spec.{ts,tsx,js,jsx}',
];

/**
 * Adoption backlog: rules from `recommended` the codebase does not satisfy yet (measured at ~269
 * findings — mostly the `eslint-plugin-react-hooks` v7 "React Compiler" rules and
 * `eslint-plugin-react` recommended). The real config is based on `recommended`, so these are
 * disabled here to keep CI green. **To adopt a rule: fix its sites, then delete its line below** —
 * it then inherits the enabled value from `recommended`. Grouped by source collection.
 */
const notYetAdopted = {
  rules: {
    // eslint:recommended (core)
    'no-undef': 'off',
    'no-unreachable': 'off',
    'no-unused-vars': 'off',
    'no-constant-binary-expression': 'off',
    // eslint-plugin-react (recommended)
    'react/no-unescaped-entities': 'off',
    'react/display-name': 'off',
    'react/no-deprecated': 'off',
    'react/jsx-key': 'off',
    'react/no-unknown-property': 'off',
    // eslint-plugin-react-hooks (recommended — React Compiler rules, new in v7)
    'react-hooks/refs': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/immutability': 'off',
    'react-hooks/preserve-manual-memoization': 'off',
    'react-hooks/static-components': 'off',
    'react-hooks/globals': 'off',
  },
};

// The real, enforced config = `recommended` (industry-standard baseline) + the monorepo's internal
// layers below (the frozen rule set, typed linting, rulesdir/i18next/sonarjs/security/jsdoc, and the
// per-path overrides). `notYetAdopted` is applied last to silence recommended rules not yet met.
export default [
  ...recommended,
  // Equivalent of the various .eslintignore files plus the old `excludedFiles`
  // (config/workspace files are not part of tsconfig and must not be type-linted).
  {
    ignores: [
      '**/build/**',
      '**/dist/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/public/**',
      '**/*autogenerated.ts',
      '**/.nx/**',
      '**/.storybook/**',
      '**/*.config.{ts,js,mjs,cjs}',
      '**/*.workspace.{ts,js}',
      'eslint.config.mjs',
      'eslint-rules/**',
      // Previously ignored via per-package .eslintignore files:
      'examples/react-ts-demo/observablehq/**',
      'examples/react-ts-demo/src/data-model/**',
      'packages/sdk-plugins/templates/repo/**',
    ],
  },

  // Main layer: production source files (ts/tsx/js/jsx).
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.node,
        ...globals.browser,
        DEVELOPMENT: 'readonly',
        VERSION: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
      sonarjs,
      promise,
      security,
      jsdoc,
      i18next,
      tsdoc,
      rulesdir,
    },
    settings: {
      react: { version: 'detect' },
      jsdoc: { mode: 'typescript' },
    },
    rules: baseRules,
  },

  // `.tsx` use-before-define matches the previous tsx-specific override.
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/no-use-before-define': [
        'warn',
        { functions: false, classes: true, variables: false, typedefs: false },
      ],
    },
  },

  // sdk-ui-angular: catch circular dependencies.
  {
    files: ['packages/sdk-ui-angular/src/**/*.{ts,tsx}'],
    rules: {
      'import/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],
    },
  },

  // Examples: literal strings are allowed.
  {
    files: ['examples/**/*'],
    rules: { 'i18next/no-literal-string': 'off' },
  },

  // Type declaration files: do not flag unused vars.
  {
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Relaxed rules for all non-production files.
  {
    files: nonProductionFiles,
    plugins: { vitest },
    rules: {
      'sonarjs/no-duplicate-string': 'off',
      'vitest/no-mocks-import': 'off',
      'import/no-extraneous-dependencies': 'off',
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

  // Unit tests: vitest rules (closely matching the former jest config).
  {
    files: ['**/*.test.{ts,tsx}'],
    plugins: { vitest },
    rules: vitestTestRules,
  },

  // analytics-composer must keep explicit extensions for Node resolution.
  {
    files: ['packages/sdk-ui/analytics-composer/**/*.{ts,tsx}'],
    rules: { 'import/extensions': ['error', 'ignorePackages'] },
  },

  // sdk-plugins/templates: source files are not subject to dependency/i18n rules
  // (mirrors the customer-facing plugin config). Ports templates/.eslintrc.cjs.
  {
    files: ['packages/sdk-plugins/templates/**/*.{ts,tsx}'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
      'i18next/no-literal-string': 'off',
    },
  },

  // vitest/valid-expect does not recognise the two-argument form expect(value, message),
  // which is valid Vitest syntax — keep it off in these packages' tests as before.
  {
    files: [
      'packages/sdk-plugins/templates/**/*.test.{ts,tsx}',
      'packages/sdk-plugins/dev/**/*.test.{ts,tsx}',
    ],
    plugins: { vitest },
    rules: { 'vitest/valid-expect': 'off' },
  },

  // Adoption backlog — disables `recommended` rules not yet satisfied (see `notYetAdopted` above).
  notYetAdopted,

  // Turn off all stylistic rules handled by Prettier. Must come last.
  prettier,
];
