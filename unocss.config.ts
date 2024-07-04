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

// loader helpers
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

export default defineConfig({
  shortcuts: {
    'bg-base': 'bg-white dark:bg-black',
    'icon-btn': 'inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600',
    'btn': 'bg-neutral-100 dark:bg-neutral-800 rounded no-underline! px2.5 py1 inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100',
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        iconoir: () => import('@iconify-json/iconoir/icons.json').then(i => i.default),
        custom: FileSystemIconLoader(
          './assets/icons',
          svg => svg.replace(/#fff/, 'currentColor'),
        ),
      },
    }),
    presetTypography({
      cssExtend: {},
    }),
    presetWebFonts({
      fonts: {
        sans: 'Noto Sans',
        serif: 'Noto Serif',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
