<script setup lang="ts">
import type { PhotoWithLocation } from '~/types/photo'

defineProps<{
  cobeId: string
  photo?: PhotoWithLocation
  place?: string
  photoCount: number
}>()
</script>

<template>
  <div
    :style="{
      positionAnchor: `--cobe-${cobeId}`,
      opacity: `var(--cobe-visible-${cobeId}, 0)`,
      filter: `blur(calc((1 - var(--cobe-visible-${cobeId}, 0)) * 8px))`,
      transform: `rotate(${photo?.rotate ?? 0}deg)`,
    }"
    class="photo-label"
  >
    <Transition name="photo-switch" mode="out-in">
      <div
        :key="photo?.path"
        bg-white p-1.5 rounded-xs shadow-2xl
      >
        <NuxtImg
          v-if="photo"
          :src="photo.path"
          :quality="40"
          :width="80"
          :height="80"
          fit="cover"
          aspect-square
          object-cover
          size-20
          shrink-0
        />
        <div text-9px text-neutral-400 text-center pt-1 font-medium uppercase tracking-wider>
          {{ place }}
        </div>
      </div>
    </Transition>
    <span
      v-if="photoCount > 1"
      absolute top--1 right--1 bg-primary text-white text-10px rounded-full w-16px h-16px flex items-center justify-center font-medium
    >
      {{ photoCount }}
    </span>
  </div>
</template>

<style>
.photo-switch-enter-active,
.photo-switch-leave-active {
  transition: opacity 0.3s ease;
}
.photo-switch-enter-from,
.photo-switch-leave-to {
  opacity: 0;
}

.photo-label {
  position: absolute;
  bottom: anchor(top);
  left: anchor(center);
  translate: -50% -20px;
  pointer-events: none;
  transition: opacity 0.3s, filter 0.3s;
}
</style>
