import { resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import checker from 'vite-plugin-checker';
import replace from 'rollup-plugin-re';
import { OutputChunk } from 'rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: false,
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk: OutputChunk) {
        return ['index.js'].includes(outputChunk.fileName);
      },
      useStrictCSP: true,
    }),
    dts({
      insertTypesEntry: true,
      tsConfigFilePath:
        mode === 'production' ? resolve(__dirname, './tsconfig.prod.json') : undefined,
    }),
    checker({
      typescript: true,
      overlay: {
        initialIsOpen: false,
      },
    }),
  ],
  define: {
    __PACKAGE_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    sourcemap: mode !== 'production',
    target: 'es6',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      treeshake: {
        preset: 'smallest',
      },
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@emotion/react',
        '@emotion/styled',
        // TODO: uncomment to externalize all MUI packages after spliting
        // to client and server packages
        //
        // '@mui/material' with all submodules
        // /^@mui\/material(?:\/\w+)*$/,
      ],
      plugins: [
        replace({
          patterns: [
            {
              // TODO: remove after externalizing all MUI packages
              transform(code: string) {
                // Workaround in MUI for webpack to support React18 API
                // https://github.com/webpack/webpack/issues/14814
                // https://github.com/mui/material-ui/issues/41190
                const muiUseIdWorkaround = "React['useId'.toString()]";
                // more stable workaround to make sure the code can't be simplified by bundler
                const betterUseIdWorkaround = 'React[`useId${Math.random()}`.slice(0, 5)]';
                if (code.includes(muiUseIdWorkaround)) {
                  return code.replace(toGlobalRegExp(muiUseIdWorkaround), betterUseIdWorkaround);
                }
              },
            },
          ],
        }),
      ],
    },
    commonjsOptions: {
      // true: wrap all CommonJS files in functions which are executed when they are required for the first time, preserving NodeJS semantics.
      // needed for socket.io-client 2.5.0
      strictRequires: true,
    },
  },
}));

/**
 * Convert a string to a global RegExp
 */
function toGlobalRegExp(str: string): RegExp {
  const escapedStr = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedStr, 'g');
}
