// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', '**/dist/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  // Module boundary enforcement
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    plugins: { '@nx': nxPlugin },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            // Allow importing root eslint config
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
          ],
          depConstraints: [
            // apps can depend on libs only
            { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['type:lib'] },
            // libs can only depend on other libs, not on apps
            { sourceTag: 'type:lib', onlyDependOnLibsWithTags: ['type:lib'] },
          ],
        },
      ],
    },
  },
);
