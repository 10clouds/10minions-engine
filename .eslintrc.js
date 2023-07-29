module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 6,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/semi': 'warn',
    curly: 'off',
    eqeqeq: 'warn',
    'no-throw-literal': 'warn',
    semi: 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
  ignorePatterns: ['out', 'dist', '**/*.d.ts'],
};
