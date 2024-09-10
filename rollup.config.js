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
      include: [`src/${name}/**/*.ts`, `src/${name}/**/*.tsx`],
      exclude: [
        ...componentNames.filter(n => n !== name).map(n => `src/${n}/**/*`),
        '**/*.test.ts',
        '**/*.test.tsx'
      ],
      declaration: true,
      declarationDir: `dist/${name}`,
    })
  ],
  external: ['react', 'react-dom', 'react-i18next', 'lucide-react'],
});

const createDtsConfig = (name) => ({
  input: `src/${name}/index.ts`,
  output: [{ file: `dist/${name}/index.d.ts`, format: 'es' }],
  plugins: [dts({ 
    tsconfig: './tsconfig.json',
    include: [`src/${name}/**/*.ts`, `src/${name}/**/*.tsx`],
    exclude: ['**/*.test.ts', '**/*.test.tsx'],
  })],
});

export default [
  ...componentNames.map(createConfig),
  ...componentNames.map(createDtsConfig),
];