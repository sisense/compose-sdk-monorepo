/* eslint-disable import/no-extraneous-dependencies -- build-only Vite plugin; postcss is a devDependency */
import postcss from 'postcss';
import type { Plugin } from 'vite';

/**
 * CSS from these node_modules packages will have their selectors scoped to
 * `SCOPE` at build time, preventing style leakage into / from host applications.
 */
const SCOPED_PACKAGES = ['react-datepicker', 'leaflet', 'fixed-data-table-2'];

/**
 * Ancestor selector shared by all sdk-ui elements.
 * Every sdk-ui component carries at least one `csdk-*` class, so
 * `[class*='csdk']` reliably matches the sdk-ui container boundary.
 */
const SCOPE = "[class*='csdk']";

const KEYFRAME_AT_RULES = new Set([
  'keyframes',
  '-webkit-keyframes',
  '-moz-keyframes',
  '-o-keyframes',
  '-ms-keyframes',
]);

const GLOBAL_SELECTORS = [':root', 'html', 'body'];

/** Prefix a single CSS selector with the sdk-ui scope. */
function addScope(selector: string): string {
  const trimmed = selector.trim();

  // :root / html / body → replace with scope so resets stay contained
  for (const globalSel of GLOBAL_SELECTORS) {
    if (trimmed === globalSel || trimmed.startsWith(`${globalSel} `)) {
      return selector.replace(globalSel, SCOPE);
    }
  }

  return `${SCOPE} ${selector}`;
}

/**
 * Vite plugin that scopes CSS from known third-party packages to the sdk-ui
 * component boundary at build time.
 *
 * How it works:
 * - Intercepts `.css` files from the `SCOPED_PACKAGES` node_modules entries.
 * - Runs each CSS rule's selectors through `addScope()`.
 * - `@keyframes` rules are left untouched (their name references would break).
 * - `@font-face` rules are left untouched (fonts should remain globally available).
 */
export function scopeThirdPartyCss(): Plugin {
  return {
    name: 'scope-third-party-css',
    enforce: 'pre',
    transform(code: string, id: string) {
      if (!id.endsWith('.css')) return null;
      if (!SCOPED_PACKAGES.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return null;

      const root = postcss.parse(code, { from: id });

      root.walkRules((rule) => {
        // Skip rules that live inside @keyframes
        if (
          rule.parent?.type === 'atrule' &&
          KEYFRAME_AT_RULES.has((rule.parent as postcss.AtRule).name)
        ) {
          return;
        }

        rule.selectors = rule.selectors.map(addScope);
      });

      return { code: root.toResult().css, map: null };
    },
  };
}
