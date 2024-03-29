import antfu from '@antfu/eslint-config'
import unocss from '@unocss/eslint-plugin'

export default await antfu(
  {
    // Or customize the stylistic rules
    stylistic: {
      indent: 2, // 4, or 'tab'
      quotes: 'single', // or 'double'
    },

    // TypeScript and Vue are auto-detected, you can also explicitly enable them:
    typescript: true,
    vue: true,

    // Disable jsonc and yaml support
    jsonc: false,
    yaml: false,

    // `.eslintignore` is no longer supported in Flat config, use `ignores` instead
    ignores: [
      './fixtures',
    // ...globs
    ],
  },
  {
    rules: {
      'no-undef': 'off',
    },
  },
  unocss.configs.flat,
)
