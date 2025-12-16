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
    head: {
      link: [
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  nitro: {
    routeRules: {
      '**': {
        headers: {
          'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Opener-Policy': 'same-origin',
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      pusherKey: import.meta.env.PUSHER_KEY,
      pusherCluster: import.meta.env.PUSHER_CLUSTER,
    },
  },
})
