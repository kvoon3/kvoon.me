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

const showGlobe = ref(false)
function toggleGlobe() {
  showGlobe.value = !showGlobe.value
}
const displayMode = ref<'cover' | 'contain'>('cover')
function toggleDisplayMode() {
  displayMode.value = displayMode.value === 'cover' ? 'contain' : 'cover'
}
</script>

<template>
  <div>
    <div py2 px4 flex justify-center gap-2>
      <Icon :size="25" :name="displayMode === 'cover' ? 'ph:crop-duotone' : 'ph:image-duotone'" icon-btn transition-all @click="toggleDisplayMode()" />
      <Icon :size="25" :name="showGlobe ? 'ph:globe-duotone' : 'ph:globe-duotone'" icon-btn transition-all :class="{ 'text-primary': showGlobe }" @click="toggleGlobe()" />
    </div>
    <Transition name="globe-drawer">
      <PhotoGlobe v-if="showGlobe" class="h-[min(400px,40vh)]" :photos="photosWithLocation" />
    </Transition>
    <PhotoGrid :meta-map="metaMap" :display-mode="displayMode" />
  </div>
</template>

<style scoped>
.globe-drawer-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.globe-drawer-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.globe-drawer-enter-from,
.globe-drawer-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  transform: translateY(-16px);
}
</style>
