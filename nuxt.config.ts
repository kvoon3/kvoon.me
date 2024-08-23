export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  // extends: '@nuxt-themes/typography',
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg', href: '/favicon.svg' }],
    },
  },
  modules: [
    '@unocss/nuxt',
    '@nuxt/content',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    'floating-vue/nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
  ],
  eslint: {
    config: {
      standalone: false,
    },
  },
  colorMode: {
    classSuffix: '',
  },
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    },
    markdown: {
      // anchorLinks: false,
    },
  },

  devtools: { enabled: true },

  css: [
    '@unocss/reset/tailwind.css',
  ],

  compatibilityDate: '2024-07-16',
})
