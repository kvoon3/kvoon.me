// Keyboard navigation composable
import { ref } from 'vue'

export function useKeyboardNavigation() {
  const slideDirection = ref<'next' | 'prev'>('next')

  const handleKeydown = (event: KeyboardEvent, options: {
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onEscape?: () => void
    onEnter?: () => void
  }) => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        options.onArrowLeft?.()
        break
      case 'ArrowRight':
        event.preventDefault()
        options.onArrowRight?.()
        break
      case 'Escape':
        event.preventDefault()
        options.onEscape?.()
        break
      case 'Enter':
        event.preventDefault()
        options.onEnter?.()
        break
    }
  }

  return {
    slideDirection,
    handleKeydown,
  }
}
