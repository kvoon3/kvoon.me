<script setup lang="ts">
import type { PhotoWithLocation } from '~/types/photo'
import createGlobe from 'cobe'
import PhotoGlobeLabel from './PhotoGlobeLabel.client.vue'

const props = defineProps<{
  photos: PhotoWithLocation[]
}>()

interface LocationGroup {
  id: string
  lat: number
  lng: number
  place?: string
  photos: PhotoWithLocation[]
}

const MIN_SCALE = 0.4
const MAX_SCALE = 2.0
const DEFAULT_SCALE = 0.95

const colorMode = useColorMode()
const canvas = ref<HTMLCanvasElement>()
const container = ref<HTMLDivElement>()
const size = reactive({ width: 0, height: 0 })
const currentScale = ref(DEFAULT_SCALE)

let globe: ReturnType<typeof createGlobe> | null = null
const animationId = 0

const isDark = computed(() => colorMode.preference === 'dark' || colorMode.value === 'dark')

const markerColor = computed<[number, number, number]>(() => isDark.value
  ? [160 / 255, 240 / 255, 236 / 255]
  : [2 / 255, 158 / 255, 145 / 255],
)

const locationGroups = computed<LocationGroup[]>(() => {
  const map = new Map<string, LocationGroup>()
  for (const photo of props.photos) {
    const key = photo.location.join(',')
    if (!map.has(key)) {
      map.set(key, {
        id: `loc-${map.size}`,
        lat: photo.location[0],
        lng: photo.location[1],
        place: photo.place,
        photos: [],
      })
    }

    map.get(key)!.photos.push(photo)
  }
  return [...map.values()]
})

const photoIndices = reactive<Record<string, number>>({})
let rotationIntervals: ReturnType<typeof setInterval>[] = []

function stopRotation() {
  for (const id of rotationIntervals)
    clearInterval(id)
  rotationIntervals = []
}

function startRotation() {
  for (const group of locationGroups.value) {
    if (group.photos.length <= 1)
      continue
    photoIndices[group.id] = 0
    // Jitter prevents all markers from cycling simultaneously
    const interval = 5000 + Math.random() * 3000
    const id = setInterval(() => {
      photoIndices[group.id] = ((photoIndices[group.id] ?? 0) + 1) % group.photos.length
    }, interval)
    rotationIntervals.push(id)
  }
}

watch(locationGroups, () => {
  stopRotation()
  startRotation()
}, { immediate: true })

const markers = computed(() =>
  locationGroups.value.map(g => ({
    location: [g.lat, g.lng] as [number, number],
    size: 0.03,
    id: g.id,
  })),
)

function initGlobe() {
  if (!canvas.value || size.width === 0)
    return

  globe?.destroy()

  globe = createGlobe(canvas.value, {
    devicePixelRatio: Math.min(window.devicePixelRatio, 2),
    width: size.width,
    height: size.height,
    phi: 0,
    theta: 0.3,
    dark: isDark.value ? 1 : 0,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 6,
    baseColor: [1, 1, 1],
    markerColor: markerColor.value,
    glowColor: [0.5, 0.5, 0.5],
    scale: currentScale.value,
    markers: markers.value,
  })
}

let phi = 3
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

function applyScale(s: number) {
  const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, s))
  if (clamped !== currentScale.value) {
    currentScale.value = clamped
    globe?.update({ scale: clamped })
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  applyScale(currentScale.value - e.deltaY * 0.001)
}

let pinchStartDistance = 0
let pinchStartScale = DEFAULT_SCALE

function getTouchDistance(e: TouchEvent): number {
  const [t0, t1] = [e.touches[0], e.touches[1]]
  if (!t0 || !t1)
    return 0
  return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY)
}

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    pointerOrigin = null
    pinchStartDistance = getTouchDistance(e)
    pinchStartScale = currentScale.value
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length !== 2)
    return
  e.preventDefault()
  if (pinchStartDistance === 0)
    return
  applyScale(pinchStartScale * (getTouchDistance(e) / pinchStartDistance))
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    pinchStartDistance = 0
  }
}

function animate() {
  phi += 0.005
  globe?.update({ phi })
  requestAnimationFrame(animate)
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
    if (!c || w === 0 || h === 0)
      return
    if (globe) {
      globe.update({ width: w, height: h })
    }
    else {
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
  stopRotation()
})

watch(isDark, (dark) => {
  globe?.update({ dark: dark ? 1 : 0 })
})

watch(markers, (m) => {
  globe?.update({ markers: m })
})
</script>

<template>
  <div
    ref="container" relative w-full max-sm:h100 touch-none
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
    @wheel="onWheel"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <canvas ref="canvas" w-full h-full />

    <PhotoGlobeLabel
      v-for="group in locationGroups"
      :key="group.id"
      :cobe-id="group.id"
      :photo="group.photos[photoIndices[group.id] ?? 0]"
      :place="group.place"
      :photo-count="group.photos.length"
    />

    <div
      v-if="locationGroups.length === 0"
      absolute inset-0 flex items-center justify-center text-sm text-neutral
    >
      No photo locations yet.
    </div>
  </div>
</template>
