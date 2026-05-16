<script setup lang="ts">
defineProps<{
  title: string
}>()

const el = useTemplateRef('header')
useMatrixTransition(el, {
  immediate: true,
})
</script>

<template>
  <h1 ref="header" text-4xl mb4 class="crt-text" font-dot>
    {{ title }}
  </h1>
</template>

<style scoped>
.crt-text {
  text-shadow: 0 2px 8px color-mix(in srgb, var(--c-primary) 30%, transparent);
}

.dark .crt-text {
  text-shadow: 0 4px 24px var(--c-primary);
}
</style>
