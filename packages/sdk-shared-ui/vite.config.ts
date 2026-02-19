/// <reference types='vitest' />
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import { join, relative, resolve } from 'path';
import { env } from 'process';
import copy from 'rollup-plugin-copy';
import { defineConfig, PluginOption } from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import { configDefaults } from 'vitest/config';

const THRESHOLD_LINES = parseInt(env.DEV_APP_THRESHOLD_LINES || '70', 10);
const THRESHOLD_FUNCTIONS = parseInt(env.DEV_APP_THRESHOLD_FUNCTIONS || '50', 10);
const THRESHOLD_BRANCHES = parseInt(env.DEV_APP_THRESHOLD_BRANCHES || '70', 10);
const THRESHOLD_STATEMENTS = parseInt(env.DEV_APP_THRESHOLD_STATEMENTS || '70', 10);

// Build variant configuration
const BUILD_VARIANT = env.BUILD_VARIANT || 'bundled'; // 'bundled' or 'lightweight'

interface FileSystem {
  readdirSync(path: string): string[];

  statSync(path: string): fs.Stats;

  existsSync(path: string): boolean;
}

const walkDir = ({
  fs,
  currentDir,
  baseDir,
  entries,
}: {
  fs: FileSystem;
  currentDir: string;
  baseDir: string;
  entries: Record<string, string>;
}) => {
  const items = fs.readdirSync(currentDir);
  items.forEach((item) => {
    const itemPath = join(currentDir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      const indexPath = join(itemPath, 'index.ts');
      if (fs.existsSync(indexPath)) {
        const relativePath = relative(baseDir, itemPath).replace(/\\/g, '/');
        entries[`lib/${relativePath}/${relativePath}`] = indexPath;
      } else {
        walkDir({ fs, currentDir: itemPath, baseDir, entries });
      }
    }
  });
};

const getEntries = (dir: string, fs: FileSystem) => {
  const entries: Record<string, string> = {
    index: resolve(__dirname, 'src/lib/index.ts'),
  };
  walkDir({ fs, currentDir: dir, baseDir: dir, entries });

  return entries;
};

const entryPoints = getEntries(resolve(__dirname, 'src/lib'), fs);

// Base external dependencies
const baseExternals = [
  'classnames',
  // React + all submodules
  /^react(?:\/[\w-]+)*$/,
  // React DOM + all submodules
  /^react-dom(?:\/[\w-]+)*$/,
];

// Additional externals for the 'lightweight' variant
const muiEmotionExternals = [
  // All MUI packages
  /^@mui(?:\/[\w-]+)*$/,
  // All Emotion packages
  /^@emotion(?:\/[\w-]+)*$/,
];

const getExternals = () => {
  if (BUILD_VARIANT === 'lightweight') {
    return [...baseExternals, ...muiEmotionExternals];
  }
  return baseExternals;
};

const getOutputDir = () => {
  return BUILD_VARIANT === 'lightweight' ? 'dist/lightweight' : 'dist';
};

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      useStrictCSP: true,
    }),
    copy({
      targets: [{ src: 'package.json', dest: getOutputDir() }],
      hook: 'writeBundle',
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: join(__dirname, 'tsconfig.lib.json'),
      outDir: getOutputDir(),
    }),
  ] as PluginOption[],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json', '.scss'],
  },
  build: {
    outDir: getOutputDir(),
    lib: {
      entry: entryPoints,
      name: 'sdk-shared-ui',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: getExternals(),
      treeshake: 'recommended',
    },
    chunkSizeWarningLimit: 500,
    sourcemap: mode === 'development',
  },
  css: {
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: 'csdk_[name]__[local]___[hash:base64:5]',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__test-helpers__/test-setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      enabled: true,
      provider: 'v8',
      thresholds: {
        lines: THRESHOLD_LINES,
        functions: THRESHOLD_FUNCTIONS,
        branches: THRESHOLD_BRANCHES,
        statements: THRESHOLD_STATEMENTS,
      },
      exclude: [
        ...configDefaults.exclude,
        'scripts/**',
        'src/index.ts',
        'src/lib/index.ts',
        'src/lib/**/index.ts',
        'src/lib/@types/**/*',
        'src/**/*.stories.tsx',
        '.storybook/**/*',
        'src/lib/Checkbox/**/*',
        'src/lib/themes/**/*',
        'src/lib/DEPRECATED_Toggle/**/*',
        'src/lib/DEPRECATED_Tooltip/**/*',
        'src/lib/constants/**/*',
        'src/lib/Icon/**/*',
        'src/lib/LazyLoader/**/*',
        'src/lib/Popover/**/*',
        'src/lib/RadioButton/**/*',
        'src/lib/Tooltip/**/*',
        'src/lib/Typography/**/*',
        'src/lib/TablePagination/**/*',
        'src/lib/Menu/**/*',
        '!src/lib/Menu/**/MenuItem/MenuItem.test.tsx',
        'src/lib/Dropdown/**/*',
        '!src/lib/Dropdown/**/DropdownButtonBody/DropdownButtonBody.test.tsx',
      ],
    },
  },
}));
