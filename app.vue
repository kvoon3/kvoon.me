<script setup lang="ts">
// import '~/styles/markdown.css'
import { isDark } from './logic/state'
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <div
      class="[background-size:16px_16px] absolute inset-0 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-white -z-10"
      dark="bg-[radial-gradient(#333_0.5px,transparent_0px)] bg-black"
    />
  </NuxtLayout>
</template>

<style>
html, body , #__nuxt {
  height: 100dvh;
  width: 100vw;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  color: #222;
  accent-color: #888;
  /* background: white; */
  color-scheme: light;
}

html.dark,
.dark body,
.dark #__nuxt {
  /* background: black !important; */
  color: #ddd !important;
  color-scheme: dark;
}

html {
  font-family: Noto Sans SC, sans-serif;
}
</style>
