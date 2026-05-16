<script setup lang="ts">
defineProps<{
  href: string
  icon: string
  label: string
}>()
</script>

<template>
  <a
    :href="href"
    :title="label"
    w-fit flex="~ items-center" gap2 bg-neutral:15 md:bg-transparent max-md="px2 rounded-full" py1
  >
    <Icon :name="icon" />
    <span text-sm md:text-base>{{ label }}</span>
  </a>
</template>
