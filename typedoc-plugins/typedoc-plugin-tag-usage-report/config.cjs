// @ts-check
/**
 * Shared configuration for the tag-report plugin.
 *
 * Edit this file to:
 *   - Add or remove tags from the report (TAGS_TO_REPORT)
 *   - Update tag descriptions or anchor IDs
 *   - Add new packages to scan (SOURCE_DIRS)
 */

'use strict';

const path = require('path');

// Absolute path to the repo root (where TypeDoc is run from).
const REPO_ROOT = process.cwd();

// The report is written to .reports/doc-tag-usage-report/ at the repo root.
const REPORT_DIR = path.join(REPO_ROOT, '.reports', 'doc-tag-usage-report');

// Tags to include in the report, in the order they appear as sections.
const TAGS_TO_REPORT = ['@beta', '@alpha', '@sisenseInternal', '@internal'];

// Human-readable description of each tag, shown in the TOC table.
const TAG_DESCRIPTIONS = {
  '@beta':            'included in docs - not yet promoted to stable API, may be removed or changed',
  '@alpha':           'excluded from docs — early feature, may be removed or changed',
  '@sisenseInternal': 'excluded from docs — used within the Sisense organization',
  '@internal':        'excluded from docs — used across packages in the monorepo',
};

// Stable HTML anchor IDs used in the TOC and section headings.
const TAG_ANCHOR = {
  '@beta':            'tag-beta',
  '@alpha':           'tag-alpha',
  '@sisenseInternal': 'tag-sisenseinternal',
  '@internal':        'tag-internal',
};

// Source directories to scan, relative to REPO_ROOT.
const SOURCE_DIRS = [
  'packages/sdk-data/src',
  'packages/sdk-ui/src',
  'packages/sdk-ui-preact/src',
  'packages/sdk-ui-angular/src',
  'packages/sdk-ui-vue/src',
];

module.exports = { REPO_ROOT, REPORT_DIR, TAGS_TO_REPORT, TAG_DESCRIPTIONS, TAG_ANCHOR, SOURCE_DIRS };
