import { fileURLToPath } from 'node:url'
import { createLocalFontProcessor } from '@unocss/preset-web-fonts/local'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    ['color-base', 'color-$k-color-primary'],
  ],
  presets: [
    presetWind3(),
    presetWebFonts({
      fonts: {
        provider: 'google',
        sans: ['Pixelify Sans', 'DM Sans'],
        // serif: 'DM Serif Display',
        // mono: 'DM Mono',
      },
      processors: createLocalFontProcessor({
        fontAssetsDir: fileURLToPath(new URL('./public/fonts', import.meta.url)),
        fontServeBaseUrl: './fonts',
      }),
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
