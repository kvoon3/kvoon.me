import {
  type CSSObject,
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
import type { CSSProperties } from 'vue'

export default defineConfig({
  shortcuts: [
    {
      'bg-base': 'bg-white dark:bg-black',
      'icon-btn': 'color-neutral-800 dark:color-neutral-100 inline-block select-none transition duration-200 ease-in-out op75 hover:op100',
      'position-y-center': 'absolute top-1/2 -translate-y-1/2',
      'position-x-center': 'absolute left-1/2 -translate-x-1/2',
      'position-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    },
    [/^btn-(\w+)$/, ([_, color]) => `op50 px2.5 py1 transition-all duration-200 ease-out no-underline! hover:(op100 text-${color} bg-${color}/10) border border-base! rounded`],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
        iconoir: () => import('@iconify-json/iconoir/icons.json').then(i => i.default),
        custom: FileSystemIconLoader(
          './app/assets/icons',
          svg => svg.replace(/#fff/, 'currentColor'),
        ),
      },
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetTypography({
      cssExtend: ({
        'a': {
          'text-decoration': 'none',
          'transition': 'all ease-in-out 0.2s',
          'border-bottom': '1px solid rgba(125, 125, 125, 0.3)',
        },
        'a:hover': {
          'border-bottom': '1px solid #bbb',
        },
        'p > code': {
          'background': 'rgba(125, 125, 125, 0.1)',
          'padding': '0.1rem 0.2rem',
          'border-radius': '0.2rem',
        },
        '.dark p > code': {
          background: 'rgba(125, 125, 125, 0.4)',
        },
        'p > code::before': {
          content: '""',
        },
        'p > code::after': {
          content: '""',
        },
      } as Record<string, CSSProperties>) as Record<string, CSSObject>,
    }),
    presetWebFonts({
      fonts: {
        sans: 'Poppins::400,600,800',
        serif: 'Roboto',
        mono: ['Fira Mono:400,600'],
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})
