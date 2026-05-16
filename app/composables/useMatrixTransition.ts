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

const CHANGE_CHAR_TIMES = 4

interface Options {
  immediate?: boolean
  times?: Times
  interval?: MaybeRefOrGetter<number>
  matrixChars?: string
  css?: {
    className?: string
    style?: string
    from?: Partial<CSSStyleDeclaration>
    to?: Partial<CSSStyleDeclaration>
  }
}

type Times = number | 'infinity'

export function useMatrixTransition<T extends HTMLElement = HTMLElement>(
  el: TemplateRef<T>,
  options?: Options,
) {
  const {
    immediate = false,
    interval = () => (Math.random() * 1000) / 3,
    matrixChars = MATRIX_CHARS,
    times = CHANGE_CHAR_TIMES,
    css = {
      className: 'char',
      // FIXME: word break
      from: { opacity: '.25', wordBreak: 'break-all' },
      to: { opacity: '1', wordBreak: 'normal' },
      style: 'transition: opacity .15s ease',
    },
  } = options ?? {}

  const line = ref('')

  const state = ref<'idle' | 'playing'>('idle')

  let shouldStop = false

  const play = async (playOptions?: {
    times?: Times
  }) => {
    if (state.value === 'playing')
      return

    if (!el.value)
      return

    const {
      times = options?.times ?? CHANGE_CHAR_TIMES,
    } = playOptions ?? {}

    el.value.innerHTML = line.value.split('').map(i => `<span class="char" style="${css.style}">${i}</span>`).join('')

    state.value = 'playing'
    shouldStop = false
    Promise.all(
      el.value.querySelectorAll<T>('.char').entries().map(async ([idx, char]) => {
        Object.assign(char.style, css.from ?? {})
        if (times === 'infinity') {
          while (true) {
            if (shouldStop)
              break

            await sleep(toValue(interval), () => char.textContent = pickRandomChar(matrixChars))
          }
        }
        else {
          for (const _ of Array.from({ length: times })) {
            await sleep(toValue(interval), () => char.textContent = pickRandomChar(matrixChars))
          }
        }

        // recover char
        await sleep(toValue(interval), () => {
          char.textContent = line.value[idx]!
          Object.assign(char.style, css.to ?? {})
        })
      }),
    ).then(() => {
      state.value = 'idle'
    })
  }

  const stop = () => {
    shouldStop = true
  }

  onMounted(() => {
    if (el.value) {
      line.value = el.value.textContent
      if (immediate)
        play({ times })
    }
  })

  return {
    state,
    play,
    stop,
  }
}

function pickRandomChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)]!
}
