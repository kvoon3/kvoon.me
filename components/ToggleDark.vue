<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  if (colorMode.preference === 'system') {
    colorMode.preference = 'light'
  }
  else if (colorMode.preference === 'light') {
    colorMode.preference = 'dark'
  }
  else {
    colorMode.preference = 'system'
  }
}
</script>

<template>
  <Icon
    :name="
      colorMode.preference === 'dark'
        ? 'pixelarticons:moon'
        : colorMode.preference === 'light'
          ? 'pixelarticons:sun'
          : 'pixelarticons:monitor'
    " px2 py1 border-1 rounded @click="toggleColorMode"
  />
</template>
