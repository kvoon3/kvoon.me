<script setup lang="ts">
import type { PhotoWithLocation } from '~/types/photo'

const props = defineProps<{
  photo?: PhotoWithLocation
  place?: string
  photoCount: number
}>()

const emit = defineEmits<{
  switchPhoto: []
}>()

function switchPhoto() {
  if (props.photoCount <= 1)
    return
  emit('switchPhoto')
}
</script>

<template>
  <div
    class="photo-label"
    @click.stop="switchPhoto"
    @pointerdown.stop
  >
    <div class="photo-card">
      <div
        class="photo-card-inner"
        :style="{ transform: `rotate(${photo?.rotate ?? 0}deg)` }"
      >
        <Transition name="photo-switch" mode="out-in">
          <div
            :key="photo?.path"
            bg-white p-1.5 rounded-xs shadow-2xl min-w-max
          >
            <NuxtImg
              v-if="photo"
              :src="photo.path"
              :quality="40"
              :width="120"
              :height="120"
              fit="cover"
              aspect-square
              object-cover
              size-30
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
    </div>
    <div class="photo-dot" />
  </div>
</template>

<style scoped>
.photo-switch-enter-active,
.photo-switch-leave-active {
  transition: opacity 0.15s ease;
}
.photo-switch-enter-from,
.photo-switch-leave-to {
  opacity: 0;
}

.photo-label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 10px;
  height: 10px;
  pointer-events: auto;
  cursor: pointer;
}

.photo-card {
  position: absolute;
  bottom: 50%;
  left: 50%;
  margin-bottom: 5px;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.photo-label:hover .photo-card,
.photo-label:focus-within .photo-card {
  opacity: 1;
  pointer-events: auto;
  transform: translate(-50%, 0);
}

.photo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c-primary);
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}
</style>
