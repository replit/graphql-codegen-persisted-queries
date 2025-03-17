import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.json",
        },
    },    
  },
  {
    ignores: ["dist/**/*"],
    files: ["**/*.ts"],
  },
);