import tsconfig from './tsconfig.json' with { type: 'json' }

const config = {
  name: 'Drop Radio Docs',
  entryPoints: 
    tsconfig.references
      .filter(ref => !ref.path.includes('e2e'))
      .map((ref) => ref.path),
  entryPointStrategy: 'packages',
  favicon: 'assets/favicon/favicon.ico',
  out: 'assets/generated-docs',
  packageOptions: {
    entryPoints: [
      'src/index.ts',
      'src/main.ts',
      'src/main.tsx'
    ],
  },
}

export default config
