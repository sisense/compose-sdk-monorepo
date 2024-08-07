import { resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import checker from 'vite-plugin-checker';
import replace from 'rollup-plugin-re';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      topExecutionPriority: false,
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk) {
        return ['index.js', 'ai.js', 'ai.cjs', 'index.cjs'].includes(outputChunk.fileName);
      },
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
  server: {
    watch: {
      ignored: [resolve(__dirname, './coverage'), '**/*.test.*'],
    },
  },
  build: {
    sourcemap: mode === 'production' ? false : true,
    target: 'es6',
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        ai: resolve(__dirname, 'src/ai/index.ts'),
        'analytics-composer': resolve(__dirname, 'src/analytics-composer/index.ts'),
      },
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      treeshake: {
        preset: 'smallest',
      },
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [
        replace({
          patterns: [
            {
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
            {
              transform(code: string) {
                // Workaround in Emotion for webpack to support React18 API
                const emotionUseInsertionEffectWorkaround = "['useInsertion' + 'Effect']";
                // more stable workaround to be sure that this code can't be simplified by bundler
                const betterUseInsertionEffectWorkaround =
                  '[`useInsertionEffect${Math.random()}`.slice(0, 5)]';
                if (code.includes(emotionUseInsertionEffectWorkaround)) {
                  return code.replace(
                    toGlobalRegExp(emotionUseInsertionEffectWorkaround),
                    betterUseInsertionEffectWorkaround,
                  );
                }
              },
            },
          ],
        }),
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
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
