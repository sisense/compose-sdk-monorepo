import js from '@eslint/js';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

// Flat-config port of the previous .eslintrc.cjs:
//   plugin:vue/vue3-essential + eslint:recommended + @vue/eslint-config-typescript
//   + @vue/eslint-config-prettier/skip-formatting
//
// @vue/eslint-config-typescript v14 pulls in typescript-eslint v8's `recommended`,
// which is stricter than the v11 set previously used here. The override block below
// restores the prior effective severities so the migration introduces no new findings
// (rules that did not exist in the former typescript-eslint version are turned off;
// rules that were `warn` before stay `warn`).
export default defineConfigWithVueTs(
  {
    ignores: [
      'build/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '**/*.config.{ts,js,mjs,cjs}',
    ],
  },
  js.configs.recommended,
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      // The following rules are new in typescript-eslint v8 and were not enforced
      // by the former @vue/eslint-config-typescript v11; keep them off to preserve behavior.
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      // v8 flags optional-chain non-null assertions the prior version did not; keep visible.
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
);
