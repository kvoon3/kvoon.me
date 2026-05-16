<script setup lang="ts">
const props = defineProps<{
  items: Record<string, {
    url: string
    icon: string
  }>
}>()

const list = computed(() => Array.from(Object.entries(props.items)))
</script>

<template>
  <ul flex="~ wrap gap2" md:flex-col>
    <li v-for="[title, { url, icon }] in list" :key="title" max-md:m0>
      <IconLink :href="url" :icon :label="title" />
    </li>
  </ul>
</template>
