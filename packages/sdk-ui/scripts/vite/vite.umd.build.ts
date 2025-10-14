// eslint-disable-next-line import/no-extraneous-dependencies
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { build } from 'vite';

import { replaceReact18Hooks } from '../vite-plugins/replace-react18-hooks';

const currentDir = dirname(fileURLToPath(import.meta.url));

const external = [
  // React + all submodules
  /^react(?:\/[\w-]+)*$/,
  // React DOM + all submodules
  /^react-dom(?:\/[\w-]+)*$/,
];

const buildUMD = async () => {
  await build({
    configFile: false,
    resolve: {
      alias: { '@': resolve(currentDir, '../../src') },
    },
    define: {
      __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        plugins: [
          [
            '@swc/plugin-emotion',
            {
              sourceMap: true,
              autoLabel: 'always',
              labelFormat: '[local]',
            },
          ],
        ],
      }),
    ],
    build: {
      target: 'es6',
      sourcemap: false,
      outDir: 'dist',
      emptyOutDir: false,
      cssCodeSplit: true,
      lib: {
        entry: resolve(currentDir, '../../src/index.umd.ts'),
        name: '@sisense/sdk-ui',
        fileName: () => 'index.umd.js',
        formats: ['umd'],
      },
      rollupOptions: {
        external,
        output: {
          globals: {
            react: '@sbi/react',
            'react-dom': '@sbi/react-dom',
            'react-dom/server': '@sbi/react-dom/server',
            'react/jsx-runtime': '@sbi/react',
          },
        },
        treeshake: {
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        plugins: [replaceReact18Hooks()],
      },
    },
  });
  console.log('UMD build complete');
};

buildUMD().catch((e) => {
  console.error('UMD build failed:', e);
  process.exit(1);
});
