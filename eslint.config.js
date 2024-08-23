import antfu from '@antfu/eslint-config'
import nuxt from '.nuxt/eslint.config.mjs'

export default nuxt(
  antfu({
    typescript: true,
    unocss: true,
    formatters: {
      css: true,
      markdown: false,
    },
  }),
)
