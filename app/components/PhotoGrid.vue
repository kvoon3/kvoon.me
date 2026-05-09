<script setup lang="ts">
import type { PhotoMeta } from '~/types/photo'
import { blurhashToCssGradientString } from '@unpic/placeholder'
import { parseFilename } from 'ufo'
import { imgRE } from '~/shared/constants'

const props = defineProps<{
  metaMap: Record<string, PhotoMeta>
  displayMode: 'cover' | 'contain'
}>()

const photos = Object.entries(import.meta.glob<{ default: string }>('../../public/photos/*', {
  eager: true,
})).map(([key, _]) => {
  const name = parseFilename(key)!
  return {
    name,
    url: `/photos/${name}`,
  }
}).filter(photo => imgRE.test(photo.name)).reverse()

function getBlurhashStyle(filename: string | undefined): Record<string, string> | undefined {
  const name = filename?.replace(imgRE, '')
  const bg = name ? props.metaMap[name]?.blurhash : undefined
  return bg ? { background: blurhashToCssGradientString(bg) } : undefined
}

const selectedPhoto = shallowRef<typeof photos[number] | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    selectedPhoto.value = null
    return
  }
  if (!selectedPhoto.value)
    return

  const idx = photos.findIndex(p => p.name === selectedPhoto.value!.name)

  if (e.key === 'ArrowLeft' && idx > 0) {
    const prev = photos[idx - 1]
    if (prev)
      selectedPhoto.value = prev
  }
  if (e.key === 'ArrowRight' && idx < photos.length - 1) {
    const next = photos[idx + 1]
    if (next)
      selectedPhoto.value = next
  }
}

watch(selectedPhoto, (val) => {
  if (val)
    document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div>
    <div p4 grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 gap-4">
      <div
        v-for="photo in photos"
        :key="photo.name"
        aspect-square
        @click="selectedPhoto = photo"
      >
        <LazyNuxtImg
          loading="lazy"
          :quality="70"
          :width="720"
          :src="photo.url"
          alt="photo"
          w-full
          h-full
          :class="props.displayMode === 'cover' ? 'object-cover' : 'object-contain'"
          :style="props.displayMode === 'cover' ? getBlurhashStyle(photo.name) : ''"
        />
        <div
          v-if="metaMap[photo.name]?.name"
          absolute bottom-0 left-0 right-0 bg-black:60 text-white text-xs px-2 py-1 truncate
        >
          {{ metaMap[photo.name]?.name }}
        </div>
      </div>

      <Teleport to="body">
        <Transition name="modal-fade">
          <div
            v-if="selectedPhoto"
            class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            style="padding: 10px"
            @click.self="selectedPhoto = null"
          >
            <NuxtImg
              :src="selectedPhoto.url"
              alt="photo"
              class="w-full h-full object-contain cursor-pointer"
              @click.stop="selectedPhoto = null"
            />
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
