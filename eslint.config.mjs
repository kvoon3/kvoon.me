// @ts-check

import antfu from '@antfu/eslint-config'
import { mdcLint } from 'mdclint'

export default antfu(
  {
    formatters: false,
    typescript: true,
    vue: true,
  },
)
  .append(await mdcLint({
    files: ['content/**/*.md'], // defaults to ['**/*.md']
    preset: 'mdc', // or 'markdown'
    config: { md013: { line_length: 100 } }, // optional markdownlint overrides
  }))
