import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    {
        ignores: ['**/dist/**', 'packages/*/dist/**']
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            '@typescript-eslint/no-unused-vars': 'error',
            'no-unused-vars': 'off',
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        }
    }
); 