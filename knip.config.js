// https://knip.dev/reference/configuration
export default {
  unocss: {
    config: ['unocss.config.ts'],
  },

  // Ignore global components and config files (not tracked by plugins)
  // Note: *.md files are ignored by default in knip
  ignoreFiles: ['**/*.global.vue', 'content.config.ts'],

  // Entry files - mark build scripts and shared utilities as entry points
  entry: [
    'app/utils/generatePhotoMeta.ts',
    'scripts/process-photos.ts',
  ],

  // Icon packages are used by @nuxt/icon at runtime
  // ESLint is managed by @nuxt/eslint
  ignoreDependencies: ['@iconify-json/*', 'eslint'],
}
