<script setup lang="ts">
import type { PhotoMeta, PhotoWithLocation } from '~/types/photo'
import { parseFilename } from 'ufo'

interface LocationTag {
  key: string
  label: string
  count: number
}

const sidecarFiles = import.meta.glob<{ default: PhotoMeta }>('../../public/photos/*.json', { eager: true })
const metaMap: Record<string, PhotoMeta> = {}
for (const [path, module] of Object.entries(sidecarFiles)) {
  const name = parseFilename(path)!.replace('.json', '')
  metaMap[name] = module.default
}

const locationTags = computed<LocationTag[]>(() => {
  const map = new Map<string, LocationTag>()
  for (const meta of Object.values(metaMap)) {
    const location = getPhotoLocation(meta)
    if (!location)
      continue

    const tag = map.get(location.key)
    if (tag) {
      tag.count += 1
      continue
    }

    map.set(location.key, {
      key: location.key,
      label: location.label,
      count: 1,
    })
  }

  return [...map.values()].sort((a, b) => {
    if (a.key === 'Unsorted')
      return 1
    if (b.key === 'Unsorted')
      return -1
    return a.label.localeCompare(b.label)
  })
})

const activeLocationKeys = ref(new Set<string>())
const initializedLocationFilters = ref(false)

watch(locationTags, (tags) => {
  const nextKeys = new Set(tags.map(tag => tag.key))
  if (!initializedLocationFilters.value) {
    activeLocationKeys.value = nextKeys
    initializedLocationFilters.value = true
    return
  }

  activeLocationKeys.value = new Set([...activeLocationKeys.value].filter(key => nextKeys.has(key)))
}, { immediate: true })

const activeLocationKeyList = computed(() => [...activeLocationKeys.value])
const hasSelectedAllLocations = computed(() => activeLocationKeys.value.size === locationTags.value.length)
const hasSelectedLocations = computed(() => activeLocationKeys.value.size > 0)

function isLocationActive(key: string): boolean {
  return activeLocationKeys.value.has(key)
}

function toggleLocation(key: string) {
  const next = new Set(activeLocationKeys.value)
  if (next.has(key))
    next.delete(key)
  else
    next.add(key)
  activeLocationKeys.value = next
}

function selectAllLocations() {
  activeLocationKeys.value = new Set(locationTags.value.map(tag => tag.key))
}

function deselectAllLocations() {
  activeLocationKeys.value = new Set()
}

const photosWithLocation = computed<PhotoWithLocation[]>(() => {
  return Object.entries(metaMap)
    .filter(([, meta]) => {
      const location = getPhotoLocation(meta)
      return location && activeLocationKeys.value.has(location.key)
    })
    .map(([name, meta]) => ({
      path: `/photos/${name}.jpg`,
      location: meta.location!,
      blurhash: meta.blurhash,
      rotate: meta.rotate,
      place: getPhotoLocation(meta)?.label,
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
const showPhotoInfo = ref(false)
function togglePhotoInfo() {
  showPhotoInfo.value = !showPhotoInfo.value
}
const showLocationFilters = ref(false)
function toggleLocationFilters() {
  showLocationFilters.value = !showLocationFilters.value
}
</script>

<template>
  <div>
    <div pt5 pb2 px4 flex justify-center gap-4>
      <button
        type="button"
        icon-btn
        transition-all
        :aria-pressed="showLocationFilters"
        :aria-label="showLocationFilters ? 'Hide location filters' : 'Show location filters'"
        :class="{ 'text-primary': showLocationFilters }"
        @click="toggleLocationFilters()"
      >
        <Icon :size="25" name="ph:funnel-duotone" />
      </button>
      <Icon :size="25" :name="displayMode === 'cover' ? 'ph:crop-duotone' : 'ph:image-duotone'" icon-btn transition-all @click="toggleDisplayMode()" />
      <Icon :size="25" name="ph:globe-duotone" icon-btn transition-all :class="{ 'text-primary': showGlobe }" @click="toggleGlobe()" />
      <button
        type="button"
        icon-btn
        transition-all
        :aria-pressed="showPhotoInfo"
        :aria-label="showPhotoInfo ? 'Hide photo information' : 'Show photo information'"
        :class="{ 'text-primary': showPhotoInfo }"
        @click="togglePhotoInfo()"
      >
        <Icon :size="25" name="ph:info-duotone" />
      </button>
    </div>
    <Transition name="globe-drawer">
      <PhotoGlobe v-if="showGlobe" class="h-[min(400px,40vh)]" :photos="photosWithLocation" />
    </Transition>
    <div v-if="showLocationFilters && locationTags.length > 0" px4 pb2 flex flex-wrap justify-center gap-2>
      <button
        type="button"
        :disabled="hasSelectedAllLocations"
        rounded-md
        border
        px3 py1
        text-sm
        inline-flex items-center gap-1
        transition outline-none
        :class="hasSelectedAllLocations
          ? 'border-neutral-200 color-neutral-400 bg-neutral/5 op-50 dark:border-neutral-800 dark:color-neutral-600'
          : 'border-neutral-300 color-neutral-700 bg-neutral/5 hover:border-primary hover:color-primary focus-visible:ring-1 focus-visible:ring-primary dark:border-neutral-700 dark:color-neutral-200'"
        @click="selectAllLocations()"
      >
        <Icon name="ph:checks-duotone" :size="16" />
        <span>Select All</span>
      </button>
      <button
        type="button"
        :disabled="!hasSelectedLocations"
        rounded-md
        border
        px3 py1
        text-sm
        inline-flex items-center gap-1
        transition outline-none
        :class="hasSelectedLocations
          ? 'border-neutral-300 color-neutral-700 bg-neutral/5 hover:border-primary hover:color-primary focus-visible:ring-1 focus-visible:ring-primary dark:border-neutral-700 dark:color-neutral-200'
          : 'border-neutral-200 color-neutral-400 bg-neutral/5 op-50 dark:border-neutral-800 dark:color-neutral-600'"
        @click="deselectAllLocations()"
      >
        <Icon name="ph:x-circle-duotone" :size="16" />
        <span>Deselect All</span>
      </button>
      <button
        v-for="tag in locationTags"
        :key="tag.key"
        type="button"
        :aria-pressed="isLocationActive(tag.key)"
        rounded-md
        border
        px3 py1
        text-sm
        transition outline-none
        :class="isLocationActive(tag.key)
          ? 'border-primary color-primary bg-primary/10 focus-visible:ring-1 focus-visible:ring-primary'
          : 'border-neutral-300 color-neutral-400 bg-neutral/5 op-70 focus-visible:ring-1 focus-visible:ring-neutral-400 dark:border-neutral-700 dark:color-neutral-500 dark:focus-visible:ring-neutral-600'"
        @click="toggleLocation(tag.key)"
      >
        <span>{{ tag.label }}</span>
        <span ml1 font-mono text-xs>({{ tag.count }})</span>
      </button>
    </div>
    <PhotoGrid
      :meta-map="metaMap"
      :display-mode="displayMode"
      :active-location-keys="activeLocationKeyList"
      :show-info="showPhotoInfo"
    />
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
