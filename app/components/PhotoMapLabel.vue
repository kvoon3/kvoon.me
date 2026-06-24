<script setup lang="ts">
import type { PhotoWithLocation } from '~/types/photo'

defineProps<{
  photo?: PhotoWithLocation
  place?: string
  photoCount: number
}>()

const emit = defineEmits<{
  switchPhoto: []
}>()
</script>

<template>
  <PhotoLabel
    class="photo-map"
    :photo="photo"
    :place="place"
    :photo-count="photoCount"
    @switch-photo="emit('switchPhoto')"
  />
</template>

<style scoped>
.photo-map {
  position: relative;
}
</style>
