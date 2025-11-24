<script setup lang="ts">
import { sleep } from '@antfu/utils'

const colorMode = useColorMode()
const isTransitioning = ref(false)

const themeTransitionDuration = useCssVar('--theme-transition-duration')

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

  // Reset transition state after animation completes
  if (themeTransitionDuration.value) {
    sleep(Number.parseInt(themeTransitionDuration.value, 10)).then(() => {
      isTransitioning.value = false
    })
  }
}
</script>

<template>
  <button p2 rounded flex="~ items-center justify-center" hover:bg-active @click="toggleColorMode">
    <Icon
      :name="
        colorMode.preference === 'dark'
          ? 'pixelarticons:moon'
          : colorMode.preference === 'light'
            ? 'pixelarticons:sun'
            : 'pixelarticons:monitor'
      "
      px2 py1 border-1 rounded
      class="bg-$c-primary transition-all duration-200 ease-in-out hover:scale-105"
      :class="{ 'opacity-70': isTransitioning }"
    />
  </button>
</template>
