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
  <ul flex="~ wrap gap2" md:flex-col md:gap-0>
    <li v-for="[title, { url, icon }] in list" :key="title">
      <a
        :href="url"
        :title
        md:w-fit
        flex="~ items-center"
        gap2
        bg-neutral:15 md:bg-transparent
        max-md="m0 rounded-full px2 py1"
      >
        <Icon :name="icon" />
        <span text-sm md:text-base>{{ title }}</span>
      </a>
    </li>
  </ul>
</template>
