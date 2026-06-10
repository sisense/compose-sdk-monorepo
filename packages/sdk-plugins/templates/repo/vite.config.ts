import { sisenseFusionPlugin } from '@sisense/sdk-plugins-dev/vite-plugin-fusion';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { UserConfig } from 'vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  const isTest = mode === 'test';
  return {
    root: command === 'serve' && !isTest ? 'dev' : '',
    envDir: process.cwd(),
    server: {
      allowedHosts: true,
      port: 3000,
    },
    plugins: isTest
      ? []
      : [
          react(),
          sisenseFusionPlugin({
            manifest: 'src/index.tsx',
          }),
        ],
    esbuild: isTest
      ? { jsx: 'automatic', jsxImportSource: 'react' }
      : undefined,
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
    resolve: {
      alias:
        command === 'serve'
          ? {
              '@models': path.resolve('dev/models'),
              '@plugin': path.resolve('src'),
            }
          : {},
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./dev/vitest.setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    },
  } as UserConfig;
});
