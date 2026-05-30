// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  name: 'biome-custom-rules',
  rules: {
    curly: 'error',
    'no-template-curly-in-string': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
})
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  })
  .override('nuxt/vue/rules', {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'vue/require-default-prop': 'off',
      'vue/html-self-closing': 'off',
    },
  });
