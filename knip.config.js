// https://knip.dev/reference/configuration

/** @type {import('knip').KnipConfig} */
export default {
  unocss: {
    config: ['unocss.config.ts'],
  },

  // Entry files — includes standalone scripts that import from devDependencies
  entry: ['scripts/process-photos.ts'],

  // Ignore global components and config files (not tracked by plugins)
  // Note: *.md files are ignored by default in knip
  ignoreFiles: ['**/*.global.vue', 'content.config.ts'],

  // Icon collections are loaded by @nuxt/icon at runtime
  // ESLint is managed by @nuxt/eslint
  ignoreDependencies: ['@iconify-json/ph', '@iconify-json/simple-icons', 'eslint'],
}
