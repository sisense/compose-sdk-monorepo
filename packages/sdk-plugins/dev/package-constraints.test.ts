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
  it('vite-plugin-dts must be ^5 or higher (v3 pulled in @microsoft/api-extractor with high-severity lodash/minimatch CVEs; v5 only depends on unplugin-dts)', () => {
    const version = (pkg.dependencies ?? {})['vite-plugin-dts'];
    expect(version, "'vite-plugin-dts' must be present in dependencies").toBeDefined();
    const major = parseInt(version?.replace(/[^0-9]/, '') ?? '0', 10);
    expect(major, "'vite-plugin-dts' must be v5 or higher").toBeGreaterThanOrEqual(5);
  });
});
