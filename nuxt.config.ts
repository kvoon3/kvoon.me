export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxtjs/color-mode',
    '@unocss/nuxt',
    '@vueuse/nuxt',
    '@nuxt/image',
  ],

  devtools: { enabled: true },

  css: [
    '~/styles/global.css',
    '@unocss/reset/tailwind.css',
  ],

  colorMode: {
    classSuffix: '',
    storage: 'cookie',
    fallback: 'dark',
  },

  eslint: {
    config: {
      standalone: false,
    },
  },
})
