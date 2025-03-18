import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  sourcemap: true,
  minify: true,
  target: 'esnext',
  outDir: 'dist',
  treeshake: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.mjs' : '.js',
    };
  },
});
