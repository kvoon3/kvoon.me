<script setup lang="ts">
definePageMeta({
  layout: 'home',
})
</script>

<template>
  <main prose="~ neutral" dark="prose-invert" m-auto mx-auto text-base>
    <ContentDoc>
      <template #not-found>
        404 Not Found
      </template>
    </ContentDoc>
  </main>
</template>
