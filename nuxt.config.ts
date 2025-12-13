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
    '@pinia/nuxt',
  ],

  devtools: { enabled: true },

  css: [
    '~/styles/global.css',
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

  // Page transitions
  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
      duration: 300,
    },
    layoutTransition: {
      name: 'layout',
      mode: 'out-in',
      duration: 300,
    },
  },

  nitro: {
    // routeRules: {
    //   '**': {
    //     headers: {
    //       'Cross-Origin-Embedder-Policy': 'require-corp',
    //       'Cross-Origin-Opener-Policy': 'same-origin',
    //     },
    //   },
    // },
  },

  runtimeConfig: {
    public: {
      pusherKey: import.meta.env.PUSHER_KEY,
      pusherCluster: import.meta.env.PUSHER_CLUSTER,
    },
  },
})
