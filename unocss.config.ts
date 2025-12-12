import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['btn', 'inline-flex items-center justify-center px-3 py-2 rounded-md transition-colors hover:bg-active'],
    ['link', 'text-primary hover:text-active transition-colors'],
    ['icon-btn', 'inline-block flex transition-all duration-300 op-75 hover:op-90 items-center justify-center gap2'],
    ['color-base', 'color-$c-primary'],
    ['bg-base', 'bg-$c-bg'],
    ['bg-active', 'bg-neutral:10'],
    ['position-x-center', 'left-1/2 -translate-x-1/2'],
    ['position-y-center', 'top-1/2 -translate-y-1/2'],
    ['position-center', 'position-x-center position-y-center'],
  ],
  presets: [
    presetWind4(),
    presetWebFonts({
      fonts: {
        provider: 'google',
        sans: ['DM Sans'],
        // sans: ['Pixelify Sans', 'DM Sans'],
        serif: 'DM Serif Display',
        mono: 'DM Mono',
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
    presetTypography(),
  ],
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
