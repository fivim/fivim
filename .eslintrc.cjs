// Refer: https://muki.tw/tech/vue/vue3-vite-typescript-tailwindcss-eslint-template/
module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020
  },
  ignorePatterns: ['src-tauri/'],
  rules: {
    'no-unused-vars': 'off',
    'vue/multi-word-component-names': 'off',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }]
  }
}
