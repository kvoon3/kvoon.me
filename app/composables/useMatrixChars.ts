import type { TemplateRef } from 'vue'
import { sleep } from '@antfu/utils'

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
    interval = () => (Math.random() * 100),
    hover = true,
  } = options ?? {}

  const line = ref('')

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

  const genRandomChar = (chars = MATRIX_CHARS): string => {
    return chars[Math.floor(Math.random() * chars.length)]!
  }

  const animateLine = () => {
    if (!el.value)
      return

    el.value.innerHTML = line.value.split('').map(i => `<span class="char">${i}</span>`).join('')

    el.value.querySelectorAll('.char')?.forEach(async (char, idx) => {
      for (const _ of Array.from({ length: 4 })) {
        await sleep(toValue(interval), () => char.textContent = genRandomChar())
      }

      await sleep(toValue(interval), () => char.textContent = line.value[idx]!)
    })
  }

  onMounted(() => {
    line.value = el.value!.textContent
    animateLine()

    const onMouseEnter = () => {
      animateLine()

      if (once)
        el.value?.removeEventListener('mouseenter', onMouseEnter)
    }

    if (hover)
      el.value?.addEventListener('mouseenter', onMouseEnter)
  })

  return {
    animateLine,
  }
}
