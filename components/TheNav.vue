<script setup lang="ts">

</script>

<template>
  <nav p4 bg-neutral:10 flex="~ items-center gap-4">
    <NuxtLink to="/">
      kvoon.me
    </NuxtLink>

    <div flex-auto />

    <NuxtLink to="/projects">
      Projects
    </NuxtLink>

    <span>/</span>

    <NuxtLink to="/about">
      About
    </NuxtLink>

    <span>/</span>

    <NuxtLink to="/photos">
      Photos
    </NuxtLink>

    <ToggleDark />
  </nav>
</template>
