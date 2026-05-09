<script setup lang="ts">
import type { PhotoMeta, PhotoWithLocation } from '~/types/photo'
import { parseFilename } from 'ufo'

const sidecarFiles = import.meta.glob<{ default: PhotoMeta }>('../../public/photos/*.json', { eager: true })
const metaMap: Record<string, PhotoMeta> = {}
for (const [path, module] of Object.entries(sidecarFiles)) {
  const name = parseFilename(path)!.replace('.json', '')
  metaMap[name] = module.default
}

const photosWithLocation = computed<PhotoWithLocation[]>(() => {
  return Object.entries(metaMap)
    .filter(([, meta]) => meta.location)
    .map(([name, meta]) => ({
      path: `/photos/${name}.jpg`,
      location: meta.location!,
      blurhash: meta.blurhash,
      rotate: meta.rotate,
      place: meta.place,
    }))
})

const [viewMode, toggleViewMode] = useToggle('grid', {
  truthyValue: 'grid',
  falsyValue: 'globe',
})
const displayMode = ref<'cover' | 'contain'>('cover')
function toggleDisplayMode() {
  displayMode.value = displayMode.value === 'cover' ? 'contain' : 'cover'
}
</script>

<template>
  <div>
    <div py2 px4 flex justify-center gap-2>
      <Icon v-if="viewMode === 'grid'" :size="25" :name="displayMode === 'cover' ? 'ph:crop-duotone' : 'ph:image-duotone'" icon-btn transition-all @click="toggleDisplayMode()" />
      <Icon :size="25" :name="viewMode === 'grid' ? 'ph:globe-duotone' : 'ph:grid-nine-duotone'" icon-btn transition-all @click="toggleViewMode()" />
    </div>
    <PhotoGlobe v-if="viewMode === 'globe'" class="h-[calc(100vh-8rem)]" :photos="photosWithLocation" />
    <PhotoGrid v-else :meta-map="metaMap" :display-mode="displayMode" />
  </div>
</template>
