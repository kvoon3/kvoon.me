export default defineNuxtConfig({
  compatibilityDate: 'latest',

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
      nuxt: {
        sortConfigKeys: true,
      },
    },
  },

  // Expose dev server to local network
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },
})
