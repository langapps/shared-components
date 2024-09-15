import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const componentNames = ['TextAreaWithControls', 'SubscriptionInfo', 'GrammarChecker'];

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
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: `./dist/${name}`,
      outDir: `./dist/${name}`,
      rootDir: 'src',
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx'
      ],
    }),
    peerDepsExternal(),
    resolve(),
    commonjs()
  ],
  external: ['react', 'react-dom', 'react-i18next', 'lucide-react'],
});

const createDtsConfig = (name) => ({
  input: `src/${name}/index.ts`,
  output: [{ file: `dist/${name}/index.d.ts`, format: 'es' }],
  plugins: [dts()],
});

export default [
  // Main bundle
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: 'dist/index.esm.js',
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
        exclude: ['**/*.test.ts', '**/*.test.tsx', './src/setupTests.ts'],
      }
      ,dts({ 
        tsconfig: './tsconfig.json',
        exclude: ['**/*.test.ts', '**/*.test.tsx'],
      })
    ),
    ],
  },
  ...componentNames.map(createConfig),
  ...componentNames.map(createDtsConfig),
];