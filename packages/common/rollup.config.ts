import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';
export default defineConfig((env) => {
  const isProduction = env.mode === 'production';
  return [
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
    },
  ];
});
