<script setup lang="ts">
import type { GeoJSONSource } from 'maplibre-gl'
import type { PhotoWithLocation } from '~/types/photo'
import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl'
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

interface GeoPoint {
  type: 'Point'
  coordinates: [number, number]
}

interface PhotoFeature {
  type: 'Feature'
  geometry: GeoPoint
  properties: Record<string, unknown>
}

interface PhotoFeatureCollection {
  type: 'FeatureCollection'
  features: PhotoFeature[]
}

const SOURCE_ID = 'photos'
const CLUSTER_LAYER = 'photo-clusters'
const COUNT_LAYER = 'photo-cluster-counts'
const POINT_LAYER = 'photo-points'
const PROTOMAPS_API_KEY = '73883c8f760f4132'

const colorMode = useColorMode()
const container = ref<HTMLDivElement>()
let map: MapLibreMap | null = null

const isDark = computed(() => colorMode.value === 'dark')

const locationGroups = computed<LocationGroup[]>(() => {
  const groups = new Map<string, LocationGroup>()
  for (const photo of props.photos) {
    const key = photo.location.join(',')
    if (!groups.has(key)) {
      groups.set(key, {
        id: `loc-${groups.size}`,
        lat: photo.location[0],
        lng: photo.location[1],
        place: photo.place,
        photos: [],
      })
    }
    groups.get(key)!.photos.push(photo)
  }
  return [...groups.values()]
})

function getStyleUrl(dark: boolean): string {
  const flavor = dark ? 'black' : 'white'
  return `https://api.protomaps.com/styles/v5/${flavor}/en.json?key=${PROTOMAPS_API_KEY}`
}

function getPhotoGeoJson(): PhotoFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: locationGroups.value.map(group => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [group.lng, group.lat],
      },
      properties: {
        id: group.id,
        place: group.place,
        count: group.photos.length,
      },
    })),
  }
}

function addPhotoLayers() {
  if (!map)
    return

  const pointColor = isDark.value ? '#22d3ee' : '#0d9488'
  const textColor = isDark.value ? '#0f172a' : '#ffffff'

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: getPhotoGeoJson(),
    cluster: true,
    clusterRadius: 50,
    clusterMaxZoom: 9,
  })

  map.addLayer({
    id: CLUSTER_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': pointColor,
      'circle-radius': ['step', ['get', 'point_count'], 16, 5, 22, 20, 28],
      'circle-opacity': 0.9,
    },
  })

  map.addLayer({
    id: COUNT_LAYER,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 12,
      'text-font': ['Noto Sans Regular'],
    },
    paint: {
      'text-color': textColor,
    },
  })

  map.addLayer({
    id: POINT_LAYER,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': pointColor,
      'circle-radius': 8,
      'circle-stroke-width': 2,
      'circle-stroke-color': isDark.value ? '#0f172a' : '#ffffff',
    },
  })
}

function updatePhotoData() {
  if (!map)
    return

  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
  source?.setData(getPhotoGeoJson())
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
    if (!map || (!e.metaKey && !e.ctrlKey))
      return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1
    map.zoomTo(map.getZoom() + delta * 0.5, { duration: 100 })
  }, { passive: false })

  const mapInstance = map
  map.on('click', CLUSTER_LAYER, (e) => {
    const feature = e.features?.[0]
    if (!feature)
      return

    const clusterId = feature.properties?.cluster_id as number
    const source = mapInstance.getSource(SOURCE_ID) as GeoJSONSource
    source.getClusterExpansionZoom(clusterId).then((zoom) => {
      if (!e.lngLat)
        return
      mapInstance.easeTo({ center: e.lngLat, zoom })
    })
  })

  map.on('mouseenter', CLUSTER_LAYER, () => {
    mapInstance.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', CLUSTER_LAYER, () => {
    mapInstance.getCanvas().style.cursor = ''
  })

  map.on('load', () => {
    addPhotoLayers()
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
  map?.remove()
  map = null
})

watch(isDark, (dark) => {
  map?.setStyle(getStyleUrl(dark))
  map?.once('style.load', () => {
    addPhotoLayers()
  })
})

watch(locationGroups, () => {
  updatePhotoData()
})
</script>

<template>
  <div class="h-full w-full">
    <div ref="container" class="h-full w-full" />
  </div>
</template>
