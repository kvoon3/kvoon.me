// https://knip.dev/reference/configuration
export default {
  unocss: {
    config: ['unocss.config.ts'],
  },

  // Ignore markdown files and global components (not tracked by plugins)
  ignoreFiles: ['*.md', '**/*.global.vue'],

  // Icon packages are used by @nuxt/icon at runtime
  // ESLint is managed by @nuxt/eslint
  ignoreDependencies: ['@iconify-json/*', 'eslint'],
}
