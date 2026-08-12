<script setup lang="ts">
import { things } from '~/data/things'

definePageMeta({
  viewTransition: true,
})

useSeoMeta({
  title: 'Things - Kevin Kwong',
  description: 'Hardware I use.',
})
</script>

<template>
  <main class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
    <header class="mb-12">
      <h1 class="text-3xl font-medium">
        Things
      </h1>
      <p class="mt-2 text-neutral-500 dark:text-neutral-400">
        Hardware I use.
      </p>
    </header>

    <div class="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
      <article v-for="thing in things" :key="thing.slug" class="min-w-0">
        <NuxtLink
          :to="`/things/${thing.slug}`"
          :aria-label="thing.name"
          class="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div class="grid h-28 place-items-center sm:h-32">
            <NuxtImg
              :src="`/things/${thing.slug}.webp`"
              alt=""
              width="900"
              height="900"
              loading="eager"
              draggable="false"
              class="thing-image h-full max-h-24 w-full max-w-32 select-none object-contain transition-transform duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 sm:max-h-28 sm:max-w-36"
              :style="{ viewTransitionName: `thing-${thing.slug}` }"
            />
          </div>
          <h2 class="mt-3 truncate text-center text-sm">
            {{ thing.name }}
          </h2>
        </NuxtLink>
      </article>
    </div>
  </main>
</template>
