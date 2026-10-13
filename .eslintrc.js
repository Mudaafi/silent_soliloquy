module.exports = {
  root: true,
  env: {
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'prettier'],
  ignorePatterns: ['dist', 'lambda', '.netlify'],
  overrides: [
    {
      // Route views are named after their route
      files: ['src/views/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off',
      },
    },
    {
      // CommonJS config files
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        semi: false,
        arrowParens: 'always',
        singleQuote: true,
        trailingComma: 'all',
        endOfLine: 'auto',
      },
    ],
  },
}
