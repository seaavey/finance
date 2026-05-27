// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  name: 'biome-custom-rules',
  rules: {
    curly: 'error',
    'no-template-curly-in-string': 'off',
  },
})
  .override('nuxt/typescript/rules', {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  })
  .override('nuxt/vue/rules', {
    rules: {
      'vue/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'vue/require-default-prop': 'off',
    },
  });
