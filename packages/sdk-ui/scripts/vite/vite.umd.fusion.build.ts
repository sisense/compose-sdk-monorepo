// Vite, plugin and dotenv are devDependencies used only in this build script
// eslint-disable-next-line import/no-extraneous-dependencies
import react from '@vitejs/plugin-react-swc';
// eslint-disable-next-line import/no-extraneous-dependencies
import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-extraneous-dependencies
import { build } from 'vite';

import { replaceReact18Hooks } from '../vite-plugins/replace-react18-hooks';

dotenv.config({
  path: resolve(process.cwd(), '.env.local'),
});

const currentDir = dirname(fileURLToPath(import.meta.url));

const external = [/^react(?:\/[\w-]+)*$/, /^react-dom(?:\/[\w-]+)*$/];

const fusionClientDir = process.env.FUSION_CLIENT_DIR;

if (!fusionClientDir) {
  throw new Error('FUSION_CLIENT_DIR env variable is not set');
}

const targetDir = resolve(currentDir, fusionClientDir);

const buildUMDDebug = async () => {
  await build({
    configFile: false,
    resolve: {
      alias: { '@': resolve(currentDir, '../../src') },
    },
    define: {
      __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version || '0.0.0'),
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
      }),
    ],
    build: {
      target: 'es6',
      sourcemap: true,
      outDir: targetDir,
      emptyOutDir: false,
      cssCodeSplit: true,
      watch: {},
      lib: {
        entry: resolve(currentDir, '../../src/index.umd.ts'),
        name: '@sisense/sdk-ui',
        fileName: () => 'sisense-sdk-ui.js',
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

  console.log('UMD DEBUG build running in watch mode');
};

buildUMDDebug().catch((e) => {
  console.error('UMD DEBUG build failed:', e);
  process.exit(1);
});
