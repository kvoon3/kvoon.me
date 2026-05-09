<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div px4 grid="~ rows-[min-content_1fr]">
    <h1 text-6xl mb4 class="crt-text" font-pixel-line>
      {{ name }}
    </h1>
    <div overflow-y-auto>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dark .crt-text {
  text-shadow: 0 4px 24px var(--c-primary);
}
</style>
