<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div px4 grid="~ rows-[min-content_1fr]">
    <h1 text-2xl font-semibold mb4>
      {{ name }}
    </h1>
    <div overflow-y-auto>
      <slot />
    </div>
  </div>
</template>
