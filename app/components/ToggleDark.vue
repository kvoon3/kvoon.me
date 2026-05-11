<script setup lang="ts">
import { sleep } from '@antfu/utils'

const colorMode = useColorMode()
const isTransitioning = ref(false)

const themeTransitionDuration = useCssVar('--theme-transition-duration')

const themeIconName = computed(() => {
  if (colorMode.preference === 'dark')
    return 'ph:moon'
  if (colorMode.preference === 'light')
    return 'ph:sun'
  return 'ph:monitor'
})

const themeLabel = computed(() => {
  if (colorMode.preference === 'dark')
    return 'Switch to system theme'
  if (colorMode.preference === 'light')
    return 'Switch to dark theme'
  return 'Switch to light theme'
})

function toggleColorMode() {
  if (isTransitioning.value)
    return

  isTransitioning.value = true

  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  }
  else if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  }
  else {
    colorMode.preference = 'system'
  }

  if (themeTransitionDuration.value) {
    sleep(Number.parseInt(themeTransitionDuration.value, 10)).then(() => {
      isTransitioning.value = false
    })
  }
}
</script>

<template>
  <button p2 rounded flex="~ items-center justify-center" hover:bg-active :aria-label="themeLabel" @click="toggleColorMode">
    <Icon
      :name="themeIconName"
      px2 py1 border-1 rounded text-5
      class="transition-all duration-200 ease-in-out hover:scale-105"
      :class="{ 'opacity-70': isTransitioning }"
      aria-hidden="true"
    />
  </button>
</template>
