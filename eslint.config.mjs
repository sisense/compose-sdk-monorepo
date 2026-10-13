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
 * Raises every enabled rule of a preset collection to `error`, preserving each rule's options.
 * Disabled entries pass through untouched.
 *
 * Severity here is binary: a rule is either enforced or off. The middle severity is a finding
 * nobody has to act on, so it accumulates silently and never gets fixed; pre-existing violations
 * are frozen in each workspace's `eslint-suppressions.json` instead. Suppressions record a
 * per-file, per-rule count of pre-existing violations; a file fails once a rule's count exceeds
 * its recorded value (swapping one violation for another of the same rule in the same file is
 * not detected — the ratchet is a count, not a fingerprint).
 *
 * @param {Record<string, unknown>} rules - Rule collection from a plugin's `recommended` preset.
 * @returns {Record<string, unknown>} The same collection with every enabled rule set to `error`.
 */
const toBinarySeverity = (rules) =>
  Object.fromEntries(
    Object.entries(rules).map(([ruleId, entry]) => {
      const [severity, ...options] = Array.isArray(entry) ? entry : [entry];
      const disabled = severity === 'off' || severity === 0;
      return [ruleId, disabled ? entry : ['error', ...options]];
    }),
  );

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
  // typescript-eslint v8 inspects `for await...of`, flagging code that was clean under the
  // previous version; the sites it found are frozen in eslint-suppressions.json.
  '@typescript-eslint/await-thenable': ['error'],
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
  '@typescript-eslint/no-explicit-any': ['error'],
  '@typescript-eslint/no-extra-non-null-assertion': ['error'],
  '@typescript-eslint/no-for-in-array': ['error'],
  '@typescript-eslint/no-implied-eval': ['error'],
  // typescript-eslint v8 is stricter here than the prior version.
  '@typescript-eslint/no-inferrable-types': ['error'],
  '@typescript-eslint/no-loop-func': ['error'],
  '@typescript-eslint/no-misused-new': ['error'],
  '@typescript-eslint/no-misused-promises': ['error'],
  '@typescript-eslint/no-namespace': ['error'],
  // typescript-eslint v8 flags cases the prior version did not.
  '@typescript-eslint/no-non-null-asserted-optional-chain': ['error'],
  '@typescript-eslint/no-non-null-assertion': ['error'],
  '@typescript-eslint/no-redeclare': ['error'],
  '@typescript-eslint/no-require-imports': ['error'],
  '@typescript-eslint/no-this-alias': ['error'],
  // typescript-eslint v8 added the "contextually unnecessary" check (and fuller type resolution
  // surfaces more cases), flagging ~600 assertions that were clean under the previous version.
  '@typescript-eslint/no-unnecessary-type-assertion': ['error'],
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
    'error',
    { vars: 'all', args: 'after-used', ignoreRestSiblings: true, argsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/no-use-before-define': ['error', 'nofunc'],
  '@typescript-eslint/no-useless-constructor': ['error'],
  '@typescript-eslint/prefer-as-const': ['error'],
  '@typescript-eslint/prefer-namespace-keyword': ['error'],
  '@typescript-eslint/require-await': ['error'],
  '@typescript-eslint/restrict-plus-operands': ['error'],
  // typescript-eslint v8 changed return-await's default semantics.
  '@typescript-eslint/return-await': ['error', 'in-try-catch'],
  '@typescript-eslint/triple-slash-reference': ['error'],
  // typescript-eslint v8 flags unbound methods the prior version did not.
  '@typescript-eslint/unbound-method': ['error'],
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
  'jsdoc/check-access': ['error'],
  'jsdoc/check-alignment': ['error'],
  'jsdoc/check-property-names': ['error'],
  'jsdoc/check-types': ['error'],
  'jsdoc/check-values': ['error'],
  'jsdoc/empty-tags': ['error'],
  'jsdoc/implements-on-classes': ['error'],
  'jsdoc/multiline-blocks': ['error'],
  'jsdoc/no-multi-asterisks': ['error'],
  'jsdoc/no-undefined-types': ['error'],
  'jsdoc/require-param-description': ['error'],
  'jsdoc/require-param-name': ['error'],
  'jsdoc/require-property': ['error'],
  'jsdoc/require-property-description': ['error'],
  'jsdoc/require-property-name': ['error'],
  'jsdoc/require-property-type': ['error'],
  'jsdoc/require-returns-check': ['error'],
  'jsdoc/require-returns-description': ['error'],
  'jsdoc/require-yields': ['error'],
  'jsdoc/require-yields-check': ['error'],
  'jsdoc/valid-types': ['error'],
  'max-depth': ['error', 3],
  // Core `no-*` rules that duplicate `js.configs.recommended` at the same severity are
  // inherited from it (applied globally via the `recommended` spread) and are no longer
  // re-listed here. Only rules that are NOT in the recommended set, or that intentionally
  // deviate from its severity, remain below.
  'no-extend-native': ['error'],
  'no-implicit-globals': ['error'],
  'no-inner-declarations': ['error'],
  // Core no-loss-of-precision (mapped from the removed TS rule) flags generated mock data that
  // the prior TS rule did not.
  'no-loss-of-precision': ['error'],
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
  ...toBinarySeverity(promise.configs.recommended.rules),
  // Recommended sets this without options; keep the frozen `ignoreLastCallback` behaviour.
  'promise/always-return': ['error', { ignoreLastCallback: true }],
  'react-hooks/exhaustive-deps': ['error'],
  'react-hooks/rules-of-hooks': ['error'],
  'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
  'rulesdir/no-lodash-whole-import': ['error'],
  'rulesdir/no-mui-barrel-import': ['error'],
  'rulesdir/opacity-zero-needs-focus-visible': ['error'],
  'rulesdir/prefer-custom-popover': ['error'],
  // Full eslint-plugin-security recommended set — all 14 `detect-*` rules, which the plugin ships
  // at the middle severity and this config raises to `error` (except `detect-object-injection`,
  // turned off below as noise).
  ...toBinarySeverity(security.configs.recommended.rules),
  // Full eslint-plugin-sonarjs recommended set. Matches the previous explicit list plus one
  // newly-adopted rule, `no-inverted-boolean-check` (its `cognitive-complexity` and
  // `elseif-without-else` rules are 'off').
  ...toBinarySeverity(sonarjs.configs.recommended.rules),

  // Added with the review-rules enforcement effort; debt lives in eslint-suppressions.json.
  // This group and the one below it must stay after the preset spreads above, whose own entries
  // for `promise/catch-or-return` and `security/detect-object-injection` would otherwise win.
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports', disallowTypeAnnotations: false },
  ],
  '@typescript-eslint/consistent-type-assertions': [
    'error',
    { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
  ],
  'promise/catch-or-return': [
    'error',
    { allowFinally: true, terminationMethod: ['catch', 'finally'] },
  ],
  // Rules deliberately kept off.
  // Noise: flags every `obj[key]` access; findings were never acted on.
  'security/detect-object-injection': ['off'],
  // Stylistic (blank lines between tags); Prettier territory.
  'jsdoc/tag-lines': ['off'],
  // Deliberately relaxed (size thresholds do not predict review findings); kept off.
  'max-lines': ['off'],
  'max-lines-per-function': ['off'],
  // Stylistic.
  'func-names': ['off'],
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
 * Severities are normalised to `error` by `toBinarySeverity`, so this baseline is stricter than
 * the template it was derived from.
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
      ...toBinarySeverity(typescriptEslintPlugin.configs.recommended.rules),
      ...toBinarySeverity(react.configs.recommended.rules),
      ...toBinarySeverity(react.configs['jsx-runtime'].rules),
      ...toBinarySeverity(reactHooks.configs.recommended.rules),
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
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
  'vitest/expect-expect': ['error'],
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

// The real, enforced config = `recommended` (industry-standard baseline) + the monorepo's internal
// layers below (the frozen rule set, typed linting, rulesdir/i18next/sonarjs/security/jsdoc, and the
// per-path overrides). Debt from rules the codebase does not yet satisfy is recorded in each
// workspace's `eslint-suppressions.json` (see `yarn lint:prune`).
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
      // Vite bundles `vite.config.ts` to a transient `vite.config.ts.timestamp-<ms>-<rand>.mjs`
      // beside it, imports it, then unlinks it. It could lead eslint to fail with ENOENT.
      '**/*.timestamp-*.mjs',
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

  // Public-surface documentation: exported symbols in package sources must carry TSDoc.
  // The jsdoc fixers are disabled on purpose: they insert empty `/** */` blocks and bare
  // `@param root0` stubs, which then fail require-param-description / tsdoc/syntax under --fix
  // (pre-commit hook, csdk-lint-fix). Missing docs must be written by a human, not scaffolded.
  {
    files: ['packages/*/src/**/*.{ts,tsx}'],
    ignores: [
      '**/*.test.{ts,tsx}',
      '**/__demo__/**',
      '**/__stories__/**',
      '**/*.stories.tsx',
      '**/__mocks__/**',
      '**/__test-helpers__/**',
      '**/test-helpers/**',
      '**/*.d.ts',
    ],
    rules: {
      'jsdoc/require-jsdoc': [
        'error',
        {
          enableFixer: false,
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: ['TSInterfaceDeclaration', 'TSTypeAliasDeclaration', 'TSEnumDeclaration'],
        },
      ],
      'jsdoc/require-param': ['error', { enableFixer: false }],
      'jsdoc/require-returns': ['error'],
      'tsdoc/syntax': ['error'],
      'jsdoc/require-description-complete-sentence': ['error'],
    },
  },

  // `.tsx` use-before-define matches the previous tsx-specific override.
  {
    files: ['**/*.tsx'],
    rules: {
      '@typescript-eslint/no-use-before-define': [
        'error',
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

  // Root-level Node scripts (ESM/CJS) — `scripts/` and the CI helpers in `ci/`: plain Node globals,
  // no browser globals, no typed linting.
  // These files aren't part of `tsconfig.eslint.json`'s program, so `parserOptions.project: null`
  // alone stops a type-checked program from being built but does not stop the `Main layer` block's
  // `baseRules` from still enabling typed (type-information-requiring) rules for them — those then
  // throw ("don't have parserOptions set to generate type information") the first time one runs.
  // `disableTypeChecked` is typescript-eslint's own config for exactly this situation (plain JS/config
  // files parsed by the TS parser without a type-aware program): it turns every typed rule off.
  {
    files: ['scripts/**/*.{mjs,cjs,js}', 'ci/**/*.{mjs,cjs,js}'],
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { project: null, projectService: false },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
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
      'jsdoc/require-returns-description': 'off',
      'no-process-exit': 'off',
      'security/detect-child-process': 'off',
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

  // Tests build fixtures with `{...} as Type`; keep the assertion rule but allow object literals.
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'as', objectLiteralTypeAssertions: 'allow' },
      ],
    },
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

  // Turn off all stylistic rules handled by Prettier. Must come last.
  prettier,
];
