<script setup lang="ts">
import { parseFilename } from 'ufo'

const photos = Object.entries(import.meta.glob<{ default: string }>('~/assets/photos/*', {
  eager: true,
})).map(([key, value]) => {
  return {
    name: parseFilename(key),
    url: value.default,
  }
}).reverse()

const selectedPhoto = shallowRef<typeof photos[number] | null>(null)
</script>

<template>
  <div grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 xl:cols-5 gap-1">
    <div
      v-for="photo in photos" :key="photo.name"
      aspect-square bg-neutral:10
      @click="selectedPhoto = photo"
    >
      <img :src="photo.url" alt="photo" w-full h-full object-cover>
    </div>
    <Teleport to="body">
      <div
        v-if="selectedPhoto"
        fixed
        inset-0 flex="~ items-center justify-center"
        @click="selectedPhoto = null"
      >
        <div absolute z-10 w-full md:max-w70vw>
          <img
            :src="selectedPhoto.url" alt="photo"
            object-cover
            mxa
            md:max-h95vh
          >
          <div text-center text-white>
            {{ selectedPhoto.name }}
          </div>
        </div>
        <div absolute inset-0 backdrop-blur-lg />
      </div>
    </Teleport>
  </div>
</template>
