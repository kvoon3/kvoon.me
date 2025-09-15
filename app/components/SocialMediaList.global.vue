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
  <ul>
    <li v-for="[title, { url, icon }] in list" :key="title" color-neutral:40 my4>
      <a :href="url" :title w-fit flex="~ gap2 items-center" color-base>
        <Icon :name="icon" />
        <span>{{ title }}</span>
      </a>
    </li>
  </ul>
</template>
