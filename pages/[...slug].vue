<script setup lang="ts">
definePageMeta({
  layout: 'home',
})
</script>

<template>
  <article dark="prose-invert" m-auto text-base prose prose-neutral>
    <ContentDoc>
      <template #not-found>
        404 Not Found
      </template>
    </ContentDoc>
  </article>
</template>
