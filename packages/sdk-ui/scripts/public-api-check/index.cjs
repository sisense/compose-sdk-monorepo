#!/usr/bin/env node
// @ts-check

const { validatePublicApiEntries } = require('./validate-public-api-entries.cjs');

/**
 * Configurable list of public api entry barrel files and required tags.
 * Add new entries to support additional export groups (alpha/beta/etc.).
 * Paths are relative to packages/sdk-ui root.
 * @type {readonly { entry: string; requiredTag: string }[]}
 */
const PUBLIC_API_ENTRIES = [
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
];

validatePublicApiEntries(PUBLIC_API_ENTRIES);
