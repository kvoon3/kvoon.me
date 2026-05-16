import type { TemplateRef } from 'vue'
import { sleep } from '@antfu/utils'

const MATRIX_CHARS = [
  '0123456789',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  // 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ',
  // 'ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ',
  '░▒▓█',
  '░▒▓█',
  '<>[]{}()\\/|!?@#$%^&*-_=+',
  '.,:;\'"`~',
].join('')

export function useMatrixChars<T extends HTMLElement = HTMLElement>(
  el: TemplateRef<T>,
  options?: {
    once?: boolean
    interval?: MaybeRefOrGetter<number>
    hover?: boolean
  },
) {
  const {
    once = false,
    interval = () => (Math.random() * 1000) / 3,
    hover = false,
  } = options ?? {}

  const line = ref('')

  const state = ref<'idle' | 'playing'>('idle')

  const genRandomChar = (chars = MATRIX_CHARS): string => {
    return chars[Math.floor(Math.random() * chars.length)]!
  }

  const play = async () => {
    if (state.value === 'playing')
      return

    if (!el.value)
      return

    el.value.innerHTML = line.value.split('').map(i => `<span class="char" style="transition: opacity .15s ease">${i}</span>`).join('')

    state.value = 'playing'
    await Promise.all(
      el.value.querySelectorAll<T>('.char').entries().map(async ([idx, char]) => {
        char.style.opacity = '.25'
        for (const _ of Array.from({ length: 4 })) {
          await sleep(toValue(interval), () => char.textContent = genRandomChar())
        }

        await sleep(toValue(interval), () => {
          char.textContent = line.value[idx]!
          char.style.opacity = '1'
        })
      }),
    )
    state.value = 'idle'
  }

  onMounted(() => {
    if (el.value) {
      line.value = el.value.textContent
      play()
    }

    const onMouseEnter = () => {
      play()

      if (once)
        el.value?.removeEventListener('mouseenter', onMouseEnter)
    }

    if (hover)
      el.value?.addEventListener('mouseenter', onMouseEnter)
  })

  return {
    state,
    play,
  }
}
