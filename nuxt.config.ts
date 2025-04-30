export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@unocss/nuxt',
    '@vueuse/nuxt',
  ],

  devtools: { enabled: true },

  css: [
    '~/styles/global.css',
    '@unocss/reset/tailwind.css',

  ],

  colorMode: {
    classSuffix: '',
  },

  compatibilityDate: '2024-11-01',

  eslint: {
    config: {
      standalone: false,
    },
  },
})
