<script setup lang="ts">
const colorMode = useColorMode()

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Icon :name=" colorMode.value === 'dark' ? 'pixelarticons:moon' : 'pixelarticons:sun'" px2 py1 border-1 rounded @click="toggleColorMode" />
</template>
