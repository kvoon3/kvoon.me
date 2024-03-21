import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: {
    'bg-base': 'bg-white dark:bg-black',
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        iconoir: () => import('@iconify-json/iconoir/icons.json').then(i => i.default),
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        providers: 'google',
        sans: 'Noto Sans SC',
        serif: 'Noto Serif SC',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
