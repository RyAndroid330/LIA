import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import nuxt from 'eslint-plugin-nuxt';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    plugins: {
      vue,
      nuxt
    },
    extends: [
      'plugin:vue/vue3-recommended',
      'plugin:nuxt/recommended' // Include Nuxt recommended settings
    ],
    rules: {
      'vue/no-unused-vars': 'warn'
    }
  }
];
