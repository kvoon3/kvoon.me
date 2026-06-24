export function useScrollHint(duration = 1500) {
  const showHint = ref(false)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function triggerHint() {
    showHint.value = true
    if (hideTimer)
      clearTimeout(hideTimer)
    hideTimer = setTimeout(() => {
      showHint.value = false
    }, duration)
  }

  onUnmounted(() => {
    if (hideTimer)
      clearTimeout(hideTimer)
  })

  return { showHint, triggerHint }
}
