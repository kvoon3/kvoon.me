<script setup lang="ts">

</script>

<template>
  <nav p4 bg-neutral:10 flex="~ items-center gap4">
    <NuxtLink to="/">
      kvoon.me
    </NuxtLink>

    <div flex-auto />

    <NuxtLink to="/">
      Home
    </NuxtLink>

    <span>/</span>

    <!-- <NuxtLink to="/projects">
      Projects
    </NuxtLink>

    <span>/</span>

    <NuxtLink to="/about">
      About
    </NuxtLink>

    <span>/</span> -->

    <NuxtLink to="/photos">
      Photos
    </NuxtLink>

    <ToggleDark />
  </nav>
</template>

<style scoped>
nav > span {
  --uno: text-neutral-800 dark: text-neutral-600;
}
</style>
