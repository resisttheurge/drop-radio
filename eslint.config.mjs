import nx from '@nx/eslint-plugin'
import jest from 'eslint-plugin-jest'
import tsdoc from 'eslint-plugin-tsdoc'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  jest.configs['flat/recommended'],
  {
    plugins: {
      tsdoc,
      jest,
    },
  },
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
      '**/test-output',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'tsdoc/syntax': 'warn',
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:server',
              onlyDependOnLibsWithTags: ['scope:server', 'scope:shared'],
            },
            {
              sourceTag: 'scope:ui',
              onlyDependOnLibsWithTags: ['scope:ui', 'scope:shared'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.spec.cts',
      '**/*.spec.mts',
      '**/*.spec.js',
      '**/*.spec.jsx',
      '**/*.spec.cjs',
      '**/*.spec.mjs',
    ],
    plugins: {
      jest,
    },
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    settings: {
      jest: {
        globalPackage: '@fast-check/jest',
      },
    },
    rules: {
      'jest/no-conditional-expect': 'error',
      'jest/no-standalone-expect': [
        'error',
        { additionalTestBlockFunctions: ['it', 'it.prop'] },
      ],
    },
  },
]
