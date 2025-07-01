import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig((env) => {
  const isProduction = env.mode === 'production';
  return {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.es.js',
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [resolve(), commonjs(), typescript()],
    watch: {
      include: 'src/**',
    },
  };
});
