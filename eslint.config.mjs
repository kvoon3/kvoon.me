// @ts-check
import antfu from '@antfu/eslint-config'
import nuxt from './.nuxt/eslint.config.mjs'

export default antfu(
  {
    formatters: true,
    typescript: true,
    vue: true,
  },
)
  .append(nuxt({
    rules: {
      'nuxt/nuxt-config-keys-order': 'error',
    },
  }))
