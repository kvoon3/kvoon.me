<script setup lang="ts">
  import { Separator } from 'reka-ui'
  import { createReusableTemplate } from '@vueuse/core'

  const [DefineSeparator, ReuseSeparator] = createReusableTemplate()
</script>

<template>
  <DefineSeparator>
    <Separator w0.5 h4 bg-neutral:20 />
  </DefineSeparator>

  <nav p4 bg-neutral:10 flex="~ items-center gap4">
    <NuxtLink to="/" class="sm:block hidden">
      kvoon.me
    </NuxtLink>

    <div flex-auto />

    <NuxtLink to="/">
      Home
    </NuxtLink>

    <ReuseSeparator />

    <!-- <NuxtLink to="/projects">
      Projects
    </NuxtLink>

    <ReuseSeparator />

    <NuxtLink to="/about">
      About
    </NuxtLink>

    <ReuseSeparator /> -->

    <NuxtLink to="/photos">
      Photos
    </NuxtLink>

    <ReuseSeparator />

    <NuxtLink to="/experiments">
      Experiments
    </NuxtLink>

    <ToggleDark />
  </nav>
</template>

<style scoped>
nav > span {
  --uno: text-neutral-800 dark: text-neutral-600;
}
</style>
