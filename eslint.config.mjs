import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  {
    ignores: ["dist/**/*", "eslint.config.mjs"],
  },
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.json",
        },
    },    
  },
);