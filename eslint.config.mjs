import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'

// eslint-config-next 16 ships native flat configs, so spread them directly
// instead of wrapping them in FlatCompat (which threw on the already-flat config).
const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,

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
