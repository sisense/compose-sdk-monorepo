import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'vite-plugin-fusion': resolve(__dirname, 'vite-plugin/vite-plugin-fusion.ts'),
      },
      name: 'sdk-plugins-dev',
      fileName: (_format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@sisense/sdk-data',
        '@sisense/sdk-ui',
        'vite',
        'vite-plugin-zip-pack',
        'node:fs',
        'node:path',
        'node:url',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
