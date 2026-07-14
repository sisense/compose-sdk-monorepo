// @ts-check

/**
 * Size budgets for the built package entries — the root bundle and every module sub-bundle.
 * Each entry is bundled by `@size-limit/esbuild` starting from its built ESM
 * file in `dist/`, following the full chunk graph, so the measured number is the real cost a
 * consumer pays for importing that entry (react/react-dom stay external as peer dependencies).
 *
 * Budgets exist to catch tree-shaking regressions: an accidental value-import from a barrel
 * file can silently pull hundreds of KB of unrelated internals into a module sub-bundle.
 * Budgets are set from the measured size at the time of introduction plus ~20% headroom for
 * organic growth. If a check fails, first look for unintended imports; raise the budget only for intentional module growth.
 *
 * Run with a fresh build in dist/: `yarn size-check`.
 */
module.exports = [
  {
    // Query module: hooks + ExecuteQuery only. Measured 87 KB on introduction;
    name: 'query',
    path: 'dist/query.js',
    limit: '105 KB',
    ignore: ['react', 'react-dom'],
  },
  {
    // AI sub-bundle legitimately includes chart rendering (NlqChartWidget); the budget is a
    // coarse growth guard only. Measured 765 KB on check introduction.
    name: 'ai',
    path: 'dist/ai.js',
    limit: '920 KB',
    ignore: ['react', 'react-dom'],
  },
  {
    // Measured 407 KB on check introduction.
    name: 'analytics-composer',
    path: 'dist/analytics-composer.js',
    limit: '490 KB',
    ignore: ['react', 'react-dom'],
  },
  {
    // Measured 66 KB on check introduction.
    name: 'analytics-composer/node',
    path: 'dist/analytics-composer/node.js',
    limit: '80 KB',
    ignore: ['react', 'react-dom'],
  },
  {
    // Root bundle contains all modules by design; the budget guards against runaway growth.
    // Measured 1.01 MB on check introduction.
    name: 'index',
    path: 'dist/index.js',
    limit: '1.2 MB',
    ignore: ['react', 'react-dom'],
  },
];
