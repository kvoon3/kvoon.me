export default defineNuxtConfig({
  // extends: '@nuxt-themes/typography',
  modules: [
    '@unocss/nuxt',
    '@nuxt/content',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    'floating-vue/nuxt',
  ],
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'vitesse-light',
        dark: 'vitesse-dark',
      },
    },
  },
  devtools: { enabled: true },
  css: [
    '@unocss/reset/tailwind.css',
  ],
})
