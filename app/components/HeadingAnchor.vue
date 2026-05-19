<script setup lang="ts">
defineProps<{
  anchor?: boolean
  as: 'h1' | 'h2' | 'h3' | 'h4'
  id?: string
}>()
</script>

<template>
  <component :is="as" :id="id" class="heading-anchor">
    <span class="heading-anchor-text">
      <slot />
    </span>
    <a
      v-if="id && anchor"
      class="heading-anchor-link not-prose op50"
      :href="`#${id}`"
      :aria-label="id"
    >#</a>
  </component>
</template>

<style scoped>
.heading-anchor {
  position: relative;
}

.heading-anchor-link {
  position: absolute;
  left: 0;
  transform: translateX(-100%);
  padding-right: 0.25em;
  opacity: 0;
  transition: opacity 0.15s;
}

.heading-anchor-text:hover ~ .heading-anchor-link {
  opacity: 50%;
}
.heading-anchor-link:hover {
  opacity: 1;
}
</style>
