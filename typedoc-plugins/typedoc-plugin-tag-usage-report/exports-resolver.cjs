// @ts-check
/**
 * Export-set resolver for the tag-report plugin.
 *
 * Walks each package's source entry point, following relative re-exports
 * recursively, to build the set of names that are reachable from the public
 * API.  Tagged declarations not in this set are excluded from the report.
 *
 * Main exports:
 *   buildExportedByPkg()             → Map<pkg, Set<name>>
 *   isExportedFromPackage(decl, map) → boolean
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { REPO_ROOT, SOURCE_DIRS } = require('./config.cjs');

// ── Entry-point configuration ─────────────────────────────────────────────────

/**
 * Override the source entry-point filename for packages that don't use
 * the conventional src/index.ts.
 */
const PKG_ENTRY = {
  'sdk-ui-angular': 'public-api.ts',
  'sdk-ui-vue':     'lib.ts',
};

// ── Module resolution ─────────────────────────────────────────────────────────

/** @param {string} p */
const isFile = (p) => { try { return fs.statSync(p).isFile(); } catch { return false; } };

/**
 * Resolve a relative module specifier to an absolute .ts/.tsx file path.
 * Returns null for npm-package specifiers or when no matching file is found.
 *
 * Handles:
 *   './foo'          → foo.ts / foo.tsx / foo/index.ts / foo/index.tsx
 *   './foo.js'       → foo.ts  (TS files imported with a .js hint)
 *   './foo/index'    → foo/index.ts
 *
 * @param {string} fromFile   Absolute path of the importing file.
 * @param {string} specifier  Module specifier from the import/export statement.
 * @returns {string | null}
 */
function resolveRelativeImport(fromFile, specifier) {
  if (!specifier.startsWith('.')) return null; // npm package — skip

  const dir = path.dirname(fromFile);
  const base = path.resolve(dir, specifier);
  const withoutJs = base.replace(/\.js$/, ''); // strip .js hints used in TS source

  for (const candidate of [
    withoutJs + '.ts',
    withoutJs + '.tsx',
    base,                               // already-extensioned specifier
    path.join(withoutJs, 'index.ts'),
    path.join(withoutJs, 'index.tsx'),
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (isFile(candidate)) return candidate;
  }
  return null;
}

// ── Export name collection ────────────────────────────────────────────────────

/**
 * Recursively collect all names exported from a TypeScript entry-point file by
 * following relative re-exports.  Non-relative specifiers (npm packages) are
 * skipped — we only care about names declared within this monorepo.
 *
 * Handles:
 *   export * from './foo'              → recurse into foo, add all its names
 *   export * as ns from './foo'        → add 'ns' (namespace); don't recurse
 *   export { X, Y as Z } [from './foo'] → add public names; recurse if 'from'
 *   export type { X } [from './foo']   → same as above
 *   export type * from './foo'         → recurse
 *   export function/class/type/const … X → add X
 *
 * @param {string} entryFile  Absolute path to the entry-point .ts file.
 * @returns {Set<string>}
 */
function collectExportedNames(entryFile) {
  /** @type {Set<string>} */
  const names = new Set();
  /** @type {Set<string>} */
  const visited = new Set();

  function visit(filePath) {
    if (visited.has(filePath)) return;
    visited.add(filePath);

    let content;
    try { content = fs.readFileSync(filePath, 'utf-8'); } catch { return; }

    // Strip comments to avoid false matches inside doc blocks or disabled code.
    const src = content
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/[^\n]*/g, '');

    // export * from './foo'  /  export type * from './foo'
    // export * as ns from './foo'  → add namespace name only; don't recurse
    for (const m of src.matchAll(/\bexport\s+(?:type\s+)?\*(?:\s+as\s+(\w+))?\s+from\s+['"]([^'"]+)['"]/g)) {
      const nsAlias = m[1];
      const specifier = m[2];
      if (nsAlias) {
        names.add(nsAlias); // e.g. filterFactory, measureFactory
      } else {
        const resolved = resolveRelativeImport(filePath, specifier);
        if (resolved) visit(resolved);
      }
    }

    // export { X, Y as Z } [from './foo']  /  export type { … }
    for (const m of src.matchAll(/\bexport\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+['"]([^'"]+)['"])?/g)) {
      for (const part of m[1].split(',')) {
        const alias = part.trim().split(/\s+as\s+/);
        const publicName = (alias[alias.length - 1] || '').trim();
        if (publicName && publicName !== 'default') names.add(publicName);
      }
      if (m[2]) {
        const resolved = resolveRelativeImport(filePath, m[2]);
        if (resolved) visit(resolved);
      }
    }

    // Direct export declarations: export function X / export const X / …
    for (const m of src.matchAll(
      /\bexport\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\s*\*?\s*|class\s+|interface\s+|type\s+|const\s+|let\s+|var\s+|enum\s+)(\w+)/g,
    )) {
      names.add(m[1]);
    }
  }

  if (isFile(entryFile)) visit(entryFile);
  return names;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build a map of pkg → Set<exportedName> for every package in SOURCE_DIRS.
 *
 * @returns {Map<string, Set<string>>}
 */
function buildExportedByPkg() {
  /** @type {Map<string, Set<string>>} */
  const map = new Map();
  for (const srcDir of SOURCE_DIRS) {
    const m = srcDir.match(/packages\/([^/]+)\/src$/);
    if (!m) continue;
    const pkg = m[1];
    const entryName = PKG_ENTRY[pkg] || 'index.ts';
    const entryFile = path.join(REPO_ROOT, srcDir, entryName);
    map.set(pkg, collectExportedNames(entryFile));
  }
  return map;
}

/**
 * Return true if the declaration is reachable from its package's public entry
 * point.
 *
 * For Property items (stored as "ContainerName.propertyName"), the check is
 * performed on the container name — the interface or type must be exported even
 * if the individual property is tagged internal.
 *
 * @param {{ name: string, file: string }} decl
 * @param {Map<string, Set<string>>} exportedByPkg
 * @returns {boolean}
 */
function isExportedFromPackage(decl, exportedByPkg) {
  const rel = path.relative(REPO_ROOT, decl.file).replace(/\\/g, '/');
  const pkgMatch = rel.match(/^packages\/([^/]+)\//);
  if (!pkgMatch) return false;

  const exported = exportedByPkg.get(pkgMatch[1]);
  if (!exported) return false;

  const lookupName = decl.name.includes('.') ? decl.name.split('.')[0] : decl.name;
  return exported.has(lookupName);
}

module.exports = { buildExportedByPkg, isExportedFromPackage };
