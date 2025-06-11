import { build } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const external = ['react', 'react-dom'];

const buildUMD = async () => {
  await build({
    configFile: false,
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    plugins: [react()],
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    build: {
      lib: {
        entry: resolve(__dirname, '../../src/lib/index.ts'),
        name: '@sisense/sdk-shared-ui',
        fileName: () => 'index.umd.js',
        formats: ['umd'],
      },
      rollupOptions: {
        external,
        output: {
          globals: {
            react: '@sbi/react',
            'react-dom': '@sbi/react-dom',
          },
        },
        treeshake: 'recommended',
      },
      sourcemap: false,
      outDir: 'dist',
      emptyOutDir: false,
      cssCodeSplit: true,
    },
  });

  console.log('UMD build complete');
};

buildUMD().catch((e) => {
  console.error('UMD build failed:', e);
  process.exit(1);
});
