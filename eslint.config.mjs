import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },

  ...coreWebVitals,
  ...typescript,

  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@next/next/no-img-element': 'off',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [{ group: 'external', pattern: 'react', position: 'before' }],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },
]

export default eslintConfig
