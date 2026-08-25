<script setup lang="ts">
import { sleep } from '@antfu/utils'

const colorMode = useColorMode()
const isTransitioning = ref(false)

const themeTransitionDuration = useCssVar('--theme-transition-duration')

const explicitPreference = computed<'light' | 'dark' | null>(() =>
  colorMode.preference === 'light' || colorMode.preference === 'dark'
    ? colorMode.preference
    : null,
)

const themeIconName = computed(() =>
  colorMode.value === 'dark' ? 'ph:moon' : 'ph:sun',
)

const themeLabel = computed(() => {
  if (explicitPreference.value)
    return 'Switch to system theme'
  return colorMode.value === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
})

function toggleColorMode() {
  if (isTransitioning.value)
    return

  isTransitioning.value = true

  colorMode.preference = explicitPreference.value
    ? 'system'
    : (colorMode.value === 'dark' ? 'light' : 'dark')

  if (themeTransitionDuration.value) {
    sleep(Number.parseInt(themeTransitionDuration.value, 10)).then(() => {
      isTransitioning.value = false
    })
  }
}
</script>

<template>
  <button p2 rounded flex="~ items-center justify-center" hover:bg-active :aria-label="themeLabel" @click="toggleColorMode">
    <ColorScheme>
      <Icon
        :name="themeIconName"
        px2 py1 border-1 rounded text-5
        class="transition-all duration-200 ease-in-out hover:scale-105"
        :class="{ 'opacity-70': isTransitioning }"
        aria-hidden="true"
      />
      <template #placeholder>
        <span class="size-[1em]" inline-block px2 py1 border-1 border-transparent rounded text-5 aria-hidden="true" />
      </template>
    </ColorScheme>
  </button>
</template>
