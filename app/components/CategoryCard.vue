<script setup lang="ts">
defineProps<{
  name: string
}>()

const el = useTemplateRef('header')
useMatrixChars(el)
</script>

<template>
  <div px4 grid="~ rows-[min-content_1fr]">
    <h1 ref="header" text-6xl mb4 class="crt-text" font-pixel>
      {{ name }}
    </h1>
    <div overflow-y-auto>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.crt-text {
  text-shadow: 0 2px 8px color-mix(in srgb, var(--c-primary) 30%, transparent);
}

.dark .crt-text {
  text-shadow: 0 4px 24px var(--c-primary);
}
</style>
