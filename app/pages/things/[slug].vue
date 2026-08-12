<script setup lang="ts">
import { things } from '~/data/things'

definePageMeta({
  viewTransition: true,
})

const route = useRoute()
const thing = things.find(thing => thing.slug === route.params.slug)

if (!thing) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Thing not found',
  })
}

useSeoMeta({
  title: `${thing.name} - Kevin Kwong`,
  description: thing.description,
})
</script>

<template>
  <main class="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
    <NuxtLink
      to="/things"
      class="inline-flex items-baseline gap-2 text-sm text-neutral-500 transition-colors hover:text-primary dark:text-neutral-400"
    >
      <span aria-hidden="true">↖</span>
      <span>Things</span>
    </NuxtLink>

    <article class="mx-auto max-w-2xl pb-12 pt-10 text-center">
      <header>
        <p class="text-sm text-neutral-500 dark:text-neutral-400">
          {{ thing.category }}
        </p>
        <h1 class="mt-2 text-balance text-3xl font-medium sm:text-4xl">
          {{ thing.name }}
        </h1>
      </header>

      <div class="mx-auto mt-10 grid h-72 max-w-lg place-items-center sm:h-80">
        <NuxtImg
          :src="`/things/${thing.slug}.webp`"
          :alt="thing.name"
          width="900"
          height="900"
          loading="eager"
          draggable="false"
          class="thing-image h-full max-h-72 w-full max-w-lg select-none object-contain sm:max-h-80"
          :style="{ viewTransitionName: `thing-${thing.slug}` }"
        />
      </div>

      <p class="mx-auto mt-12 max-w-lg text-lg leading-8 text-neutral-600 dark:text-neutral-300">
        {{ thing.description }}
      </p>

      <a
        :href="thing.imageSource"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-5 inline-block text-xs text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-primary dark:text-neutral-400 dark:decoration-neutral-700"
      >
        Image source
      </a>
    </article>
  </main>
</template>
