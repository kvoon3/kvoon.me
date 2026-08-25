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
    ['icon-btn', 'inline-block flex transition-all duration-300 op-75 hover:op-90 items-center justify-center gap2'],
    ['color-base', 'color-$c-base'],
    ['bg-base', 'bg-$c-bg'],
    ['bg-active', 'bg-neutral:10'],
    ['position-x-center', 'left-1/2 -translate-x-1/2'],
    ['position-y-center', 'top-1/2 -translate-y-1/2'],
    ['position-center', 'position-x-center position-y-center'],
    ['border-base', 'border-neutral-300 dark:border-neutral-500 border-op-75 hover:border-op-100 transition-colors duration-300'],
    ['shadow-highlight', 'shadow-[0_0_10px_#a0f0eccd] transition-shadow duration-300'],
  ],
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'DM Sans',
        mono: 'DM Mono',
        dot: 'Doto',
      },
    }),
    presetAttributify(),
    presetIcons({
      scale: 1.4,
    }),
    presetTypography({
      cssExtend: {
        'a': {
          'text-decoration': 'none',
          'border-bottom': '1px solid color-mix(in srgb, var(--colors-neutral-400) 60%, transparent)',
          'transition': 'border-color .3s ease',
        },
        'a:hover': {
          'border-color': 'var(--c-primary)',
        },
      },
    }),
  ],
  theme: {
    colors: {
      primary: 'var(--c-primary)',
    },
  },
  transformers: [
    transformerVariantGroup(),
    transformerDirectives(),
  ],
})
