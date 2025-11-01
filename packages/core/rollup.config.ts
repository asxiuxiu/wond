import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import postcssUrl from 'postcss-url';

export default defineConfig([
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.es.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        include: ['src/**/*.ts'],
      }),
      postcss({
        inject: true,
        plugins: [
          postcssUrl({
            url: 'inline',
          }),
        ],
      }),
      copy({
        targets: [
          {
            src: 'node_modules/canvaskit-wasm/bin/canvaskit.wasm',
            dest: 'dist',
          },
        ],
      }),
    ],
    watch: {
      include: 'src/**',
    },
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
    external: [/\.css$/],
  },
]);
