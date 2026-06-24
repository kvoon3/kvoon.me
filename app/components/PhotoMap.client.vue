<script setup lang="ts">
import type { App } from 'vue'
import type { PhotoWithLocation } from '~/types/photo'
import { Map as MapLibreMap, Marker, NavigationControl } from 'maplibre-gl'
import { createApp } from 'vue'
import PhotoMapLabel from './PhotoMapLabel.vue'
import 'maplibre-gl/dist/maplibre-gl.css'

const props = defineProps<{
  photos: PhotoWithLocation[]
  initialCenter?: [number, number]
}>()

interface LocationGroup {
  id: string
  lat: number
  lng: number
  place?: string
  photos: PhotoWithLocation[]
}

const PROTOMAPS_API_KEY = '73883c8f760f4132'

const colorMode = useColorMode()
const container = ref<HTMLDivElement>()
let map: MapLibreMap | null = null

interface MarkerEntry {
  marker: Marker
  app: App
  el: HTMLElement
}

const markers = new Map<string, MarkerEntry>()
const photoIndices = reactive<Record<string, number>>({})
const { showHint, triggerHint } = useScrollHint()

const isDark = computed(() => colorMode.value === 'dark')

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

function resetPhotoIndices() {
  for (const group of locationGroups.value) {
    photoIndices[group.id] = Math.floor(Math.random() * group.photos.length)
  }
}

watch(locationGroups, resetPhotoIndices, { immediate: true })

function switchPhoto(group: LocationGroup) {
  if (group.photos.length <= 1)
    return
  photoIndices[group.id] = ((photoIndices[group.id] ?? 0) + 1) % group.photos.length
  updateMarker(group)
}

function getStyleUrl(dark: boolean): string {
  const flavor = dark ? 'black' : 'white'
  return `https://api.protomaps.com/styles/v5/${flavor}/en.json?key=${PROTOMAPS_API_KEY}`
}

function clearMarkers() {
  for (const { marker, app } of markers.values()) {
    marker.remove()
    app.unmount()
  }
  markers.clear()
}

function fitBounds() {
  if (!map || locationGroups.value.length === 0)
    return

  if (locationGroups.value.length === 1) {
    const group = locationGroups.value[0]!
    map.easeTo({ center: [group.lng, group.lat], zoom: 10, duration: 500 })
    return
  }

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const group of locationGroups.value) {
    minLng = Math.min(minLng, group.lng)
    maxLng = Math.max(maxLng, group.lng)
    minLat = Math.min(minLat, group.lat)
    maxLat = Math.max(maxLat, group.lat)
  }

  map.fitBounds(
    [[minLng, minLat], [maxLng, maxLat]],
    { padding: 80, maxZoom: 12, duration: 500 },
  )
}

function mountLabel(el: HTMLElement, group: LocationGroup) {
  const photo = group.photos[photoIndices[group.id] ?? 0]
  const app = createApp(PhotoMapLabel, {
    photo,
    place: group.place,
    photoCount: group.photos.length,
    onSwitchPhoto: () => switchPhoto(group),
  })
  app.mount(el)
  return app
}

function createMarker(group: LocationGroup) {
  if (!map)
    return

  const el = document.createElement('div')
  const app = mountLabel(el, group)

  const marker = new Marker({ element: el, anchor: 'center' })
    .setLngLat([group.lng, group.lat])
    .addTo(map)

  markers.set(group.id, { marker, app, el })
}

function updateMarker(group: LocationGroup) {
  const entry = markers.get(group.id)
  if (!entry)
    return

  const instance = (entry.app as unknown as { _instance?: { props: { photo?: PhotoWithLocation, photoCount: number } } })._instance
  if (!instance)
    return

  instance.props.photo = group.photos[photoIndices[group.id] ?? 0]
  instance.props.photoCount = group.photos.length
}

function updateMarkers() {
  if (!map)
    return

  const currentIds = new Set(locationGroups.value.map(group => group.id))
  for (const [id, entry] of markers) {
    if (!currentIds.has(id)) {
      entry.marker.remove()
      entry.app.unmount()
      markers.delete(id)
    }
  }

  for (const group of locationGroups.value) {
    if (!markers.has(group.id))
      createMarker(group)
    else
      updateMarker(group)
  }
}

function initMap() {
  if (!container.value || map)
    return

  const { clientWidth, clientHeight } = container.value
  if (clientWidth === 0 || clientHeight === 0)
    return

  map = new MapLibreMap({
    container: container.value,
    style: getStyleUrl(isDark.value),
    center: props.initialCenter ?? [114.0579, 22.5431],
    zoom: 10,
    minZoom: 3,
    maxZoom: 15,
    scrollZoom: false,
    dragRotate: false,
  })

  map.addControl(new NavigationControl())

  container.value.addEventListener('wheel', (e) => {
    if (!map)
      return
    if (!e.metaKey && !e.ctrlKey) {
      triggerHint()
      return
    }
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    map.zoomTo(map.getZoom() + delta * 0.5, { duration: 100 })
  }, { passive: false })

  map.on('load', () => {
    updateMarkers()
    fitBounds()
  })
}

function ensureMapReady() {
  if (!container.value)
    return
  const { clientWidth, clientHeight } = container.value
  if (clientWidth === 0 || clientHeight === 0)
    return
  if (!map)
    initMap()
  else
    map.resize()
}

let ro: ResizeObserver | null = null
let io: IntersectionObserver | null = null

watch(container, (el) => {
  if (!el || io)
    return

  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting)
        ensureMapReady()
    }
  })
  io.observe(el)

  ro = new ResizeObserver(() => {
    ensureMapReady()
  })
  ro.observe(el)
}, { immediate: true })

onUnmounted(() => {
  io?.disconnect()
  ro?.disconnect()
  clearMarkers()
  map?.remove()
  map = null
})

watch(isDark, (dark) => {
  map?.setStyle(getStyleUrl(dark))
  map?.once('style.load', () => {
    updateMarkers()
  })
})

watch(locationGroups, () => {
  updateMarkers()
  fitBounds()
})
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="container" class="h-full w-full" />
    <PhotoScrollHint :show="showHint" />
  </div>
</template>

<style scoped>
:deep(.maplibregl-canvas-container) {
  cursor: default !important;
}
</style>
