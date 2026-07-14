#!/usr/bin/env node
// @ts-check

const { validatePublicApiEntries } = require('./validate-public-api-entries.cjs');

/**
 * Configurable list of public api entry barrel files and required tags.
 * Add new entries to support additional export groups (alpha/beta/etc.).
 * Paths are relative to packages/sdk-ui root.
 * @type {readonly { entry: string; requiredTag?: string, forbiddenTags?: string[]; }[]}
 */
const PUBLIC_API_ENTRIES = [
  {
    entry: 'src/public-api/public.ts',
    forbiddenTags: ['@internal', '@beta', '@alpha', '@sisenseInternal'],
  },
  {
    entry: 'src/public-api/sisense-internal.ts',
    requiredTag: '@sisenseInternal',
  },
  {
    entry: 'src/public-api/beta.ts',
    requiredTag: '@beta',
  },
  {
    entry: 'src/public-api/alpha.ts',
    requiredTag: '@alpha',
  },
  {
    entry: 'src/public-api/internal.ts',
    requiredTag: '@internal',
  },
  // `query` module gateway (src/modules/query/public-api) — validated the same way as root.
  {
    entry: 'src/modules/query/public-api/public.ts',
    forbiddenTags: ['@internal', '@beta', '@alpha', '@sisenseInternal'],
  },
  {
    entry: 'src/modules/query/public-api/beta.ts',
    requiredTag: '@beta',
  },
  {
    entry: 'src/modules/query/public-api/alpha.ts',
    requiredTag: '@alpha',
  },
  {
    entry: 'src/modules/query/public-api/internal.ts',
    requiredTag: '@internal',
  },
];

validatePublicApiEntries(PUBLIC_API_ENTRIES);
