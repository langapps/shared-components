import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const componentNames = ['TextAreaWithControls', 'SubscriptionInfo'];

const createConfig = (name) => ({
  input: `src/${name}/index.ts`,
  output: [
    {
      file: `dist/${name}/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: `dist/${name}/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ 
      tsconfig: './tsconfig.json',
      include: [`src/${name}/**/*.ts`],
      exclude: componentNames.filter(n => n !== name).map(n => `src/${n}/**/*`),
    }),
    dts({ 
      tsconfig: './tsconfig.json',
      include: [`src/${name}/**/*.ts`],
      outputDir: `dist/${name}`,
    }),
  ],
});

export default [
  // Individual component bundles
  ...componentNames.map(createConfig),
];