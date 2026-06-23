import type { MaybeRef } from 'vue'

export function useScrollOutside(
  target: MaybeRef<HTMLElement | null | undefined>,
  callback: (event: WheelEvent) => void,
): () => void {
  return useEventListener(window, 'wheel', (event) => {
    const el = unrefElement(target)
    if (el && !el.contains(event.target as Node))
      callback(event)
  }, { passive: true })
}
