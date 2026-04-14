/**
 * Guards against dependency version regressions that caused real build failures.
 * These checks are intentionally static (read package.json directly) so they
 * fail at test-time rather than at user build-time.
 */
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const pkg = require('./package.json') as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

describe('package.json dependency constraints', () => {
  it('vite-plugin-dts must be v3+ (v2.x causes Collector.js.js double-extension error on Node 18+)', () => {
    const range = (pkg.dependencies ?? {})['vite-plugin-dts'];
    expect(range, "'vite-plugin-dts' must be listed in dependencies").toBeTruthy();
    // ^2.x, ~2.x, or bare 2.x would install a broken version; require v3 or higher
    expect(range).not.toMatch(/^[\^~]?2\./);
  });
});
