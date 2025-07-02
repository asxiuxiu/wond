import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import * as sass from 'sass';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig((env) => {
  const isProduction = env.mode === 'production';
  return {
    plugins: [
      react(),
      viteStaticCopy({
        targets: [
          {
            src: '../../packages/core/dist/canvaskit.wasm',
            dest: '.',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@wond/core': isProduction
          ? resolve(__dirname, '../../packages/core/dist/index.es.js')
          : resolve(__dirname, '../../packages/core/src/index.ts'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          additionalData: `@use "sass:math"; @use "sass:color";`,
          implementation: sass,
          sassOptions: {
            outputStyle: 'expanded',
          },
        },
      },
    },
    server: {
      port: 3000,
      host: true,
    },
    build: {},
  };
});
