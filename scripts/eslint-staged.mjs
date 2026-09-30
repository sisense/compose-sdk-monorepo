#!/usr/bin/env node
// Runs eslint on staged files grouped by workspace so each workspace's
// eslint-suppressions.json is picked up (eslint resolves it from the cwd).
// Walking up from a file, the first directory below root that has a
// package.json is that file's workspace. If the workspace has an
// eslint-suppressions.json, the file is linted from that workspace's cwd.
// If it doesn't, the workspace is unbaselined (no debt has been frozen for
// it), so the file is skipped rather than linted with an empty baseline —
// yarn lint doesn't lint it either. Files that belong to no workspace
// (root-level scripts/**, eslint-rules/**, root config files) are linted
// from the repo root, as before.
//
// Invokes the root workspace's ESLint 9 binary via `yarn run -T eslint`
// rather than `npx eslint`: several workspaces pin eslint@^8 in their own
// devDependencies, so a nested node_modules/eslint (v8, no suppressions
// support) can shadow the root one when resolved from a workspace cwd.
// `yarn run -T` always resolves the root-declared binary under Yarn 3.
//
// Root-level *.mjs files (this one included) are covered by the `scripts/**`
// block in eslint.config.mjs, which supplies Node globals for this directory,
// so no explicit global directive is needed here for `process` / `console` /
// `URL`.
//
// When `--fix` repairs a staged file, entries in that workspace's
// eslint-suppressions.json can become unused, and ESLint exits 2 ("There are
// suppressions left that do not occur anymore") to flag the stale debt. In
// that case we re-run ESLint with `--prune-suppressions` for the same files
// and, if that succeeds, `git add` the pruned eslint-suppressions.json so it
// joins the commit automatically instead of blocking it.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const files = process.argv.slice(2);

// Returns the first ancestor directory (below root) that contains a
// package.json, or null if the file belongs to no workspace (i.e. it's
// covered by the root package.json only).
function findWorkspaceDir(file) {
  let dir = dirname(file);
  while (dir.startsWith(root) && dir !== root) {
    if (existsSync(resolve(dir, 'package.json'))) return dir;
    dir = dirname(dir);
  }
  return null;
}

const groups = new Map();
for (const f of files) {
  const absFile = resolve(f);
  const wsDir = findWorkspaceDir(absFile);
  if (wsDir === null) {
    groups.set(root, [...(groups.get(root) ?? []), absFile]);
    continue;
  }
  if (existsSync(resolve(wsDir, 'eslint-suppressions.json'))) {
    groups.set(wsDir, [...(groups.get(wsDir) ?? []), absFile]);
    continue;
  }
  console.error(
    `eslint-staged: skipping ${relative(
      root,
      absFile,
    )} (workspace has no eslint-suppressions.json; not linted by yarn lint)`,
  );
}

let failed = false;
for (const [ws, list] of groups) {
  const relativeFiles = list.map((f) => relative(ws, f));
  if (process.env.ESLINT_STAGED_DEBUG) {
    console.error(`[eslint-staged] cwd=${ws} files=${relativeFiles.join(', ')}`);
  }
  const result = spawnSync('yarn', ['run', '-T', 'eslint', '--fix', ...relativeFiles], {
    cwd: ws,
    stdio: 'inherit',
  });
  if (result.status === 0) {
    continue;
  }
  if (result.status === 2) {
    const pruneResult = spawnSync(
      'yarn',
      ['run', '-T', 'eslint', '--prune-suppressions', ...relativeFiles],
      { cwd: ws, stdio: 'inherit' },
    );
    const addResult =
      pruneResult.status === 0
        ? spawnSync('git', ['add', resolve(ws, 'eslint-suppressions.json')], { cwd: ws })
        : null;
    if (addResult !== null && addResult.status === 0) {
      console.error(
        `eslint-staged: pruned suppressions in ${relative(
          root,
          ws,
        )} (debt paid down by --fix); eslint-suppressions.json staged`,
      );
      continue;
    }
    failed = true;
    continue;
  }
  failed = true;
}
process.exit(failed ? 1 : 0);
