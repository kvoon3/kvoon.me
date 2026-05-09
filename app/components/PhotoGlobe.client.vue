<script setup lang="ts">
import type { PhotoWithLocation } from '~/types/photo'
import createGlobe from 'cobe'

const props = defineProps<{
  photos: PhotoWithLocation[]
}>()

interface LocationGroup {
  id: string
  lat: number
  lng: number
  photos: PhotoWithLocation[]
}

const colorMode = useColorMode()
const canvas = ref<HTMLCanvasElement>()
const container = ref<HTMLDivElement>()
const size = reactive({ width: 0, height: 0 })

let globe: ReturnType<typeof createGlobe> | null = null
let animationId = 0

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.value === 'dark')

const locationGroups = computed<LocationGroup[]>(() => {
  const map = new Map<string, LocationGroup>()
  for (const photo of props.photos) {
    const key = photo.location.join(',')
    if (!map.has(key)) {
      map.set(key, {
        id: `loc-${map.size}`,
        lat: photo.location[0],
        lng: photo.location[1],
        photos: [],
      })
    }
    map.get(key)!.photos.push(photo)
  }
  return [...map.values()]
})

const markers = computed(() =>
  locationGroups.value.map(g => ({
    location: [g.lat, g.lng] as [number, number],
    size: Math.min(0.03 + g.photos.length * 0.005, 0.07),
    id: g.id,
  })),
)

function initGlobe() {
  if (!canvas.value || size.width === 0)
    return

  globe?.destroy()

  globe = createGlobe(canvas.value, {
    devicePixelRatio: 2,
    width: size.width * 2,
    height: size.height * 2,
    phi: 0,
    theta: 0.3,
    dark: isDark.value ? 1 : 0,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [1, 1, 1],
    markerColor: [1, 1, 1],
    glowColor: [0.5, 0.5, 0.5],
    scale: 0.95,
    markers: markers.value,
  })
}

let phi = 0
let dragOffset = 0
let pointerOrigin: number | null = null
let dragOffsetAtStart = 0

function onPointerDown(e: PointerEvent) {
  pointerOrigin = e.clientX
  dragOffsetAtStart = dragOffset
}

function onPointerMove(e: PointerEvent) {
  if (pointerOrigin === null)
    return
  dragOffset = dragOffsetAtStart + (e.clientX - pointerOrigin) / 200
}

function onPointerUp() {
  pointerOrigin = null
}

function animate() {
  if (pointerOrigin === null) {
    phi += 0.003
    dragOffset *= 0.94
  }
  globe?.update({ phi: phi + dragOffset })
  animationId = requestAnimationFrame(animate)
}

function updateSize() {
  if (!container.value)
    return
  size.width = container.value.clientWidth
  size.height = container.value.clientHeight
}

let ro: ResizeObserver | null = null

watch(container, (value) => {
  if (!value)
    return

  updateSize()
  animate()

  ro = new ResizeObserver(() => {
    updateSize()
  })
  ro.observe(value)
})

watch(
  [canvas, () => size.width, () => size.height],
  ([c, w, h]) => {
    if (c && w > 0 && h > 0) {
      initGlobe()
    }
  },
)

onUnmounted(() => {
  if (animationId)
    cancelAnimationFrame(animationId)

  globe?.destroy()

  ro?.disconnect()
  ro = null
})

watch(isDark, (dark) => {
  globe?.update({ dark: dark ? 1 : 0 })
})

watch(markers, (m) => {
  globe?.update({ markers: m })
}, { deep: true })
</script>

<template>
  <div
    ref="container" relative w-full max-sm:h100 touch-none
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <canvas ref="canvas" w-full h-full />

    <div
      v-for="group in locationGroups"
      :key="group.id"
      :style="{
        positionAnchor: `--cobe-${group.id}`,
        top: `anchor(--cobe-${group.id} bottom)`,
        left: `anchor(--cobe-${group.id} center)`,
        opacity: `var(--cobe-visible-${group.id}, 0)`,
      }"
      class="photo-label"
    >
      <NuxtImg
        :src="group.photos[0]!.path"
        :quality="40"
        :width="40"
        :height="40"
        fit="cover"
        border-4
        border-neutral-300
        shadow-sm
        aspect-square
        object-cover
        size-20
      />
      <span
        v-if="group.photos.length > 1"
        absolute top--1 right--1 bg-primary text-white text-10px rounded-full w-16px h-16px flex items-center justify-center font-medium
      >
        {{ group.photos.length }}
      </span>
    </div>

    <div
      v-if="locationGroups.length === 0"
      absolute inset-0 flex items-center justify-center text-sm text-neutral
    >
      No photo locations yet.
    </div>
  </div>
</template>

<style>
.photo-label {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% calc(-1000% - 20px);
  margin-bottom: 8px;
  padding: 0.25rem 0.5rem;
  background: #1a1a1a;
  color: #fff;
  font-size: 0.75rem;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  transition: opacity 0.3s;
}
</style>
