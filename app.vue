<script setup lang="ts">
import '~/styles/markdown.css'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
html, body , #__nuxt {
  height: 100dvh;
  margin: 0;
  padding: 0;
  color: #222;
  accent-color: #888;
  background: white;
  color-scheme: light;
}

html.dark,
.dark body,
.dark #__nuxt {
  background: black !important;
  color: #ddd !important;
  color-scheme: dark;
}

html {
  --uno: of-x-hidden;
  font-family: Noto Sans SC, sans-serif;
}
</style>
