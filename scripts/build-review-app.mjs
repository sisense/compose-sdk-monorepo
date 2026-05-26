/**
 * Builds all three demo apps (React, Vue, Angular) and assembles them into
 * the root public/ directory for GitLab Pages or local preview.
 *
 * Each app receives DEMO_BASE_PATH — the full base path for that specific app.
 * Apps default to '/' when the variable is absent; they know nothing about
 * REVIEW_APP_BASE_PATH or the multi-app structure.
 *
 * Usage (local — apps build under /react/, /vue/, /angular/ by default):
 *   node scripts/build-review-app.mjs
 *
 * Usage (CI — REVIEW_APP_BASE_PATH is set by the review-app:deploy job):
 *   REVIEW_APP_BASE_PATH=/compose-sdk-monorepo/mr-42/ node scripts/build-review-app.mjs
 *
 * Sisense credentials for React and Vue are read from VITE_APP_* env vars:
 *   VITE_APP_SISENSE_URL, VITE_APP_SISENSE_TOKEN
 *
 * Angular credentials are injected by ci/generate-angular-env.mjs before this
 * script runs (handled by the CI job and by `yarn review-app:build` at root level).
 *
 * Output layout:
 *   public/react/
 *   public/vue/
 *   public/angular/
 *
 * The root public/index.html is a tracked file and is NOT touched by this script.
 *
 * Feature injections:
 *   env-switcher  Already baked into each app's build output automatically via
 *                 the Vite plugin (React/Vue) and angular.json scripts (Angular).
 *   back-nav      Injected here into each copied index.html. Only meaningful in
 *                 the review-app preview (../  → home page).
 *   source-link   Injected here into each copied index.html. Adds a fixed badge
 *                 (orange for MR, green for staging) linking to the source MR or
 *                 master branch. The home page (public/index.html) inlines the
 *                 same badge logic directly since it is a tracked file.
 */

import { cpSync, copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Root base path provided by CI (e.g. /compose-sdk-monorepo/mr-42/).
// Locally this is unset; each app's subpath becomes /react/, /vue/, /angular/.
const basePath = process.env.REVIEW_APP_BASE_PATH ?? '/';

function run(cmd, extraEnv = {}) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env, ...extraEnv },
  });
}

// ── Build apps ─────────────────────────────────────────────────────────────

// ── React ──────────────────────────────────────────────────────────────────
run('yarn workspace @sisense/sdk-ui demo:build', {
  DEMO_BASE_PATH: `${basePath}react/`,
});

// ── Vue ────────────────────────────────────────────────────────────────────
run('yarn workspace @sisense/vue-ts-demo build', {
  DEMO_BASE_PATH: `${basePath}vue/`,
});

// ── Angular ────────────────────────────────────────────────────────────────
run('yarn workspace @sisense/angular-demo build', {
  DEMO_BASE_PATH: `${basePath}angular/`,
});

// ── Assemble into root public/ ─────────────────────────────────────────────

// Read feature scripts once (single source of truth for each).
const backNavScript    = readFileSync(resolve(rootDir, 'scripts/demo-features/back-nav.js'),    'utf8');
const sourceLinkScript = readFileSync(resolve(rootDir, 'scripts/demo-features/source-link.js'), 'utf8');

/**
 * Injects a feature script inline before </body> in the given HTML file.
 * Idempotent: guarded by a marker comment.
 *
 * @param {string} htmlPath  Absolute path to the HTML file.
 * @param {string} marker    Unique HTML comment used as idempotency guard.
 * @param {string} script    JS source to inject.
 */
function injectFeature(htmlPath, marker, script) {
  let html = readFileSync(htmlPath, 'utf8');
  if (html.includes(marker)) return; // already injected
  const injection = `${marker}\n<script>\n${script}\n</script>`;
  html = html.replace('</body>', `${injection}\n</body>`);
  writeFileSync(htmlPath, html, 'utf8');
}

const injectBackNav    = (p) => injectFeature(p, '<!-- csdk-feature:back-nav -->',    backNavScript);
const injectSourceLink = (p) => injectFeature(p, '<!-- csdk-feature:source-link -->', sourceLinkScript);

// Copy feature scripts to public/ so the review-app main page can load them via <script src>.
// public/index.html is a tracked file not modified by this script; it references
// these as static assets. source-link.js does its own URL-segment detection, so the
// same file works at the root page and at any sub-app depth.
const envSwitcherSrc  = resolve(rootDir, 'scripts/demo-features/env-switcher');
const envSwitcherDest = resolve(rootDir, 'public/env-switcher');
console.log(`▶ Copying env-switcher: ${envSwitcherSrc} → ${envSwitcherDest}`);
mkdirSync(envSwitcherDest, { recursive: true });
cpSync(envSwitcherSrc, envSwitcherDest, { recursive: true });
console.log('  ✓ env-switcher available for review-app main page');

const sourceLinkSrc  = resolve(rootDir, 'scripts/demo-features/source-link.js');
const sourceLinkDest = resolve(rootDir, 'public/source-link.js');
console.log(`▶ Copying source-link: ${sourceLinkSrc} → ${sourceLinkDest}`);
copyFileSync(sourceLinkSrc, sourceLinkDest);
console.log('  ✓ source-link available for review-app main page');

const copies = [
  {
    label: 'React',
    src: resolve(rootDir, 'packages/sdk-ui/public'),
    dest: resolve(rootDir, 'public/react'),
  },
  {
    label: 'Vue',
    src: resolve(rootDir, 'examples/vue-ts-demo/dist'),
    dest: resolve(rootDir, 'public/vue'),
  },
  {
    label: 'Angular',
    src: resolve(rootDir, 'examples/angular-demo/dist'),
    dest: resolve(rootDir, 'public/angular'),
  },
];

for (const { label, src, dest } of copies) {
  console.log(`▶ Copying ${label}: ${src} → ${dest}`);
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  injectBackNav(resolve(dest, 'index.html'));
  injectSourceLink(resolve(dest, 'index.html'));
  console.log(`  ✓ Injected back-nav + source-link into ${dest}/index.html`);
}

console.log('\n✓ Review app build complete. Run `yarn review-app:serve` to preview locally.');
