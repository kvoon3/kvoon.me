<script setup lang="ts">
interface Thing {
  slug: string
  name: string
  link: string
  retired?: boolean
}

defineProps<{
  items: Thing[]
}>()
</script>

<template>
  <div class="not-prose grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
    <article v-for="thing in items" :key="thing.slug" class="min-w-0">
      <a
        :href="thing.link"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="thing.retired ? `${thing.name}, previously used` : thing.name"
        class="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div class="grid h-28 place-items-center sm:h-32">
          <NuxtImg
            :src="`/things/${thing.slug}.webp`"
            alt=""
            width="900"
            height="900"
            loading="lazy"
            draggable="false"
            class="thing-image h-full max-h-24 w-full max-w-32 select-none object-contain transition-all duration-300 ease-out group-hover:scale-105 group-focus-visible:scale-105 sm:max-h-28 sm:max-w-36"
            :class="{ 'opacity-55 grayscale': thing.retired }"
          />
        </div>
        <p class="mt-3 truncate text-center text-sm" :class="{ 'line-through text-neutral-500 dark:text-neutral-400': thing.retired }">
          {{ thing.name }}
        </p>
        <p v-if="thing.retired" class="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-400">
          Previously used
        </p>
      </a>
    </article>
  </div>
</template>
