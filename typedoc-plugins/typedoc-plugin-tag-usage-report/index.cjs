// @ts-check
/**
 * TypeDoc plugin — API Tag Usage Report
 *
 * Generates .reports/doc-tag-usage-report/TAG_USAGE_REPORT.md whenever `yarn docs:gen:md` is run.
 * The report lists all API declarations tagged with a visibility or maturity
 * modifier (@internal, @sisenseInternal, @alpha, @beta), grouped by tag,
 * package, and source subdirectory, with collapsible sections and source links.
 *
 * Unlike a naive TypeDoc-model walk, the plugin scans the original .ts/.tsx
 * source files directly.  This captures tagged items that TypeDoc excludes from
 * its model (e.g. properties on non-exported types), while a separate export
 * filter ensures only declarations reachable from each package's entry point
 * make it into the report.
 *
 * Module layout
 * ─────────────
 *   config.cjs           Shared constants (tags, packages, paths).
 *   scanner.cjs          JSDoc-comment parser and source-file scanner.
 *   exports-resolver.cjs Walks re-export graphs to determine public API surface.
 *   report-writer.cjs    Converts scan results into the markdown report file.
 *   index.cjs            This file — TypeDoc plugin entry point.
 */

'use strict';

const path = require('path');
const { Converter } = require('typedoc');

const { REPO_ROOT, REPORT_DIR, SOURCE_DIRS } = require('./config.cjs');
const { scanSourceFiles }        = require('./scanner.cjs');
const { buildExportedByPkg, isExportedFromPackage } = require('./exports-resolver.cjs');
const { writeReport, writeSimpleReport } = require('./report-writer.cjs');

/**
 * TypeDoc plugin entry point.
 *
 * @param {{ application: import('typedoc').Application }} params
 */
exports.load = function ({ application }) {
  // Hook into the end of TypeDoc's resolution phase.  All data collection is
  // done independently of the TypeDoc model — the hook is only used as a
  // reliable trigger that runs after the project has been fully loaded.
  application.converter.on(Converter.EVENT_RESOLVE_END, () => {
    const absDirs = SOURCE_DIRS.map((d) => path.join(REPO_ROOT, d));

    // 1. Scan source files for tagged declarations.
    const allDecls = scanSourceFiles(absDirs);

    // 2. Build per-package export sets and filter to publicly-exported items.
    const exportedByPkg  = buildExportedByPkg();
    const exportedDecls  = allDecls.filter((d) => isExportedFromPackage(d, exportedByPkg));

    application.logger.info(
      `[tag-report] ${allDecls.length} tagged declarations found, ` +
      `${exportedDecls.length} exported from their package.`,
    );

    // 3. Write the markdown report and the plain-text simple report.
    writeReport(exportedDecls, path.join(REPORT_DIR, 'TAG_USAGE_REPORT.md'), application.logger);
    writeSimpleReport(exportedDecls, path.join(REPORT_DIR, 'TAG_USAGE_REPORT_SIMPLE.txt'), application.logger);
  });
};
