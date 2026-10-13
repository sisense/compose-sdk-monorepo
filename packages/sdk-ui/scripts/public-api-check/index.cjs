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
    entry: 'src/public-api/beta.ts',
    requiredTag: '@beta',
  },
  {
    entry: 'src/public-api/alpha.ts',
    requiredTag: '@alpha',
  },
  // `internal` module gateway (src/modules/internal) — the `@internal` tier.
  {
    entry: 'src/modules/internal/public-api/internal.ts',
    requiredTag: '@internal',
  },
  // `sisense-internal` module gateway (src/modules/sisense-internal) — the `@sisenseInternal` tier.
  {
    entry: 'src/modules/sisense-internal/public-api/sisense-internal.ts',
    requiredTag: '@sisenseInternal',
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

/**
 * Package entries validated as a whole: every symbol the entry exports, `export *` chains
 * included, must satisfy the entry's tag policy.
 * @type {readonly { entry: string; requiredTag?: string; forbiddenTags?: string[]; }[]}
 */
const ENTRY_SURFACES = [
  // `@sisense/sdk-ui/internal` — Compose SDK cross-package use only.
  {
    entry: 'src/modules/internal/index.ts',
    requiredTag: '@internal',
  },
  // `@sisense/sdk-ui/sisense-internal` — in-company hosts; changes affect other repositories.
  {
    entry: 'src/modules/sisense-internal/index.ts',
    requiredTag: '@sisenseInternal',
  },
];

validatePublicApiEntries(PUBLIC_API_ENTRIES, ENTRY_SURFACES);
