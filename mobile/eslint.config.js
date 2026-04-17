// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['components/dressai-legacy-app.js'],
    rules: {
      'import/no-unresolved': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
]);
