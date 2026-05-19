<script setup lang="ts">
const props = defineProps<{
  id?: string
}>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(() => Boolean(props.id) && (
  (typeof headings?.anchorLinks === 'boolean' && headings.anchorLinks)
  || (typeof headings?.anchorLinks === 'object' && headings.anchorLinks?.h3)
))
</script>

<template>
  <HeadingAnchor :id="id" :anchor="generate" as="h3">
    <slot />
  </HeadingAnchor>
</template>
