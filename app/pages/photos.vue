<script setup lang="ts">
import type { PhotoGridItem, PhotoMeta, PhotoWithLocation } from '~/types/photo'
import { useRouteQuery } from '@vueuse/router'
import { parseFilename } from 'ufo'
import { imgRE } from '~/shared/constants'
import { formatDate, getPhotoDate, parseDate } from '~/utils/photo-date'

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

const photoFiles = import.meta.glob<{ default: string }>('../../public/photos/*', { eager: true })

const photos = computed<PhotoGridItem[]>(() => {
  return Object.entries(photoFiles)
    .map(([path]) => {
      const name = parseFilename(path)!
      const stem = name.replace(imgRE, '')
      const location = getPhotoLocation(metaMap[stem] ?? {})
      return {
        name,
        stem,
        url: `/photos/${name}`,
        locationKey: location?.key,
        date: getPhotoDate(name) ?? new Date(0),
      }
    })
    .filter(photo => imgRE.test(photo.name))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
})

const locationTags = computed<LocationTag[]>(() => {
  const map = new Map<string, LocationTag>()
  for (const photo of photos.value) {
    if (!photo.locationKey)
      continue

    const location = getPhotoLocation(metaMap[photo.stem] ?? {})
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

const tagQuery = useRouteQuery('tags')
const locationKeys = computed(() => locationTags.value.map(tag => tag.key))

function getLocationKeysFromQuery(value: typeof tagQuery.value): Set<string> | undefined {
  if (value == null)
    return

  return new Set((Array.isArray(value) ? value : [value])
    .flatMap(part => part.split(','))
    .map(key => key.trim())
    .filter(Boolean))
}

const activeLocationKeys = computed<Set<string>>({
  get() {
    const queryKeys = getLocationKeysFromQuery(tagQuery.value)
    return queryKeys
      ? new Set(locationKeys.value.filter(key => queryKeys.has(key)))
      : new Set(locationKeys.value)
  },
  set(keys) {
    const selectedKeys = locationKeys.value.filter(key => keys.has(key))
    tagQuery.value = selectedKeys.length === locationKeys.value.length
      ? undefined
      : selectedKeys.join(',')
  },
})

const hasSelectedAllLocations = computed(() => activeLocationKeys.value.size === locationTags.value.length)
const hasSelectedLocations = computed(() => activeLocationKeys.value.size > 0)

const startQuery = useRouteQuery('start')
const endQuery = useRouteQuery('end')

const photoDateRange = computed<{ min: Date, max: Date } | undefined>(() => {
  const times = photos.value.map(photo => photo.date.getTime()).filter(time => time > 0)
  if (times.length === 0)
    return undefined
  return {
    min: new Date(Math.min(...times)),
    max: new Date(Math.max(...times)),
  }
})

const startDate = computed<Date>({
  get() {
    return parseDate(startQuery.value) ?? photoDateRange.value?.min ?? new Date()
  },
  set(date) {
    startQuery.value = formatDate(date)
  },
})

const endDate = computed<Date>({
  get() {
    return parseDate(endQuery.value, true) ?? photoDateRange.value?.max ?? new Date()
  },
  set(date) {
    endQuery.value = formatDate(date)
  },
})

const uniquePhotoDates = computed(() => {
  const datesByKey = new Map<string, Date>()
  for (const photo of photos.value) {
    if (photo.date.getTime() > 0)
      datesByKey.set(formatDate(photo.date), photo.date)
  }
  return [...datesByKey.values()].sort((a, b) => b.getTime() - a.getTime())
})

function setStartDate(date: Date) {
  startDate.value = date
  if (date.getTime() > endDate.value.getTime())
    endDate.value = date
}

function setEndDate(date: Date) {
  endDate.value = date
  if (date.getTime() < startDate.value.getTime())
    startDate.value = date
}

function resetDateRange() {
  startQuery.value = undefined
  endQuery.value = undefined
}

const filteredPhotos = computed(() => {
  return photos.value.filter((photo) => {
    const locationMatch = !photo.locationKey || activeLocationKeys.value.has(photo.locationKey)
    const time = photo.date.getTime()
    const dateMatch = time >= startDate.value.getTime() && time <= endDate.value.getTime()
    return locationMatch && dateMatch
  })
})

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
  activeLocationKeys.value = new Set(locationKeys.value)
}

function deselectAllLocations() {
  activeLocationKeys.value = new Set()
}

function selectRandomLocations() {
  const keys = locationKeys.value
  if (keys.length === 0)
    return

  const selectedKeys = keys.filter(() => Math.random() >= 0.5)
  if (selectedKeys.length === 0)
    selectedKeys.push(keys[Math.floor(Math.random() * keys.length)]!)

  activeLocationKeys.value = new Set(selectedKeys)
}

const photosWithLocation = computed<PhotoWithLocation[]>(() => {
  return Object.entries(metaMap)
    .filter(([, meta]) => {
      const location = getPhotoLocation(meta)
      return location && activeLocationKeys.value.has(location.key)
    })
    .map(([name, meta]) => {
      const location = getPhotoLocation(meta)!
      return {
        path: `/photos/${name}.jpg`,
        location: meta.location!,
        blurhash: meta.blurhash,
        rotate: meta.rotate,
        place: location.label,
        locationKey: location.key,
      }
    })
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
  <div space-y-4 py4>
    <div flex justify-center gap-4>
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
    <Transition name="filter-drawer">
      <div v-if="showLocationFilters && (uniquePhotoDates.length > 0 || locationTags.length > 0)" space-y-4 px4 pb2>
        <div v-if="uniquePhotoDates.length > 0" flex justify-center gap-4>
          <PhotoDateSelect label="Start" :dates="uniquePhotoDates" :selected="startDate" @select="setStartDate" />
          <PhotoDateSelect label="End" :dates="uniquePhotoDates" :selected="endDate" @select="setEndDate" />
          <button
            v-if="startQuery != null || endQuery != null"
            type="button"
            rounded-md
            border
            px3 py1
            text-sm
            inline-flex items-center gap-1
            transition outline-none
            class="border-neutral-300 color-neutral-700 bg-neutral/5 hover:border-primary hover:color-primary focus-visible:ring-1 focus-visible:ring-primary dark:border-neutral-700 dark:color-neutral-200"
            @click="resetDateRange()"
          >
            <Icon name="ph:arrow-counter-clockwise-duotone" :size="16" />
            <span>Reset</span>
          </button>
        </div>
        <div v-if="locationTags.length > 0" space-y-2>
          <div flex flex-wrap justify-center gap-2>
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
              type="button"
              rounded-md
              border
              px3 py1
              text-sm
              inline-flex items-center gap-1
              transition outline-none
              class="border-neutral-300 color-neutral-700 bg-neutral/5 hover:border-primary hover:color-primary focus-visible:ring-1 focus-visible:ring-primary dark:border-neutral-700 dark:color-neutral-200"
              @click="selectRandomLocations()"
            >
              <Icon name="ph:shuffle-duotone" :size="16" />
              <span>Random</span>
            </button>
          </div>
          <div flex flex-wrap justify-center gap-2>
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
        </div>
      </div>
    </Transition>
    <PhotoGrid
      :photos="filteredPhotos"
      :meta-map="metaMap"
      :display-mode="displayMode"
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

.filter-drawer-enter-active,
.filter-drawer-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.filter-drawer-enter-from,
.filter-drawer-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
