<script setup lang="ts">
import type { PhotoMeta } from '~/types/photo'
import { blurhashToCssGradientString } from '@unpic/placeholder'
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
} from 'reka-ui'

import { parseFilename } from 'ufo'
import { imgRE } from '~/shared/constants'

// Import composables
const { isFullscreen, toggle: toggleFullScreen } = useFullscreen()
const { slideDirection, handleKeydown } = useKeyboardNavigation()

// Import component
const PhotoPreview = defineAsyncComponent(() => import('../components/PhotoPreview.vue'))

// Load photo metadata (blurhash)
const photoMeta = import.meta.glob<{ default: PhotoMeta }>('../../public/photo-meta.json', { eager: true })
const metaMap: Record<string, PhotoMeta> = Object.assign({}, ...Object.values(photoMeta).map(m => m.default))

const photos = Object.entries(import.meta.glob<{ default: string }>('../../public/photos/*', {
  eager: true,
})).map(([key, _]) => {
  const name = parseFilename(key)
  return {
    name,
    url: `/photos/${name}`,
  }
}).reverse()

// Get blurhash style object for a photo
function getBlurhashStyle(filename: string | undefined): Record<string, string> | undefined {
  const name = filename?.replace(imgRE, '')
  const bg = name ? metaMap[name]?.blurhash : undefined
  return bg ? { background: blurhashToCssGradientString(bg) } : undefined
}

const selectedPhoto = shallowRef<typeof photos[number] | null>(null)
const isDialogOpen = computed(() => !!selectedPhoto.value)
const showInfo = ref(true)
const userHiddenInfo = ref(false)

// Keyboard navigation handler
function handlePhotoKeydown(event: KeyboardEvent) {
  if (!selectedPhoto.value)
    return

  const currentIndex = photos.findIndex(photo => photo.name === selectedPhoto.value?.name)

  handleKeydown(event, {
    onArrowLeft: () => {
      if (currentIndex > 0) {
        slideDirection.value = 'prev'

        // Temporarily show info when switching photos
        if (userHiddenInfo.value) {
          showInfo.value = true
          setTimeout(() => {
            const prevPhoto = photos[currentIndex - 1]
            if (selectedPhoto.value?.name === prevPhoto?.name) {
              showInfo.value = false
            }
          }, 2500)
        }

        selectedPhoto.value = photos[currentIndex - 1] || null
      }
    },
    onArrowRight: () => {
      if (currentIndex < photos.length - 1) {
        slideDirection.value = 'next'

        // Temporarily show info when switching photos
        if (userHiddenInfo.value) {
          showInfo.value = true
          setTimeout(() => {
            const nextPhoto = photos[currentIndex + 1]
            if (selectedPhoto.value?.name === nextPhoto?.name) {
              showInfo.value = false
            }
          }, 2500)
        }

        selectedPhoto.value = photos[currentIndex + 1] || null
      }
    },
    onEscape: () => {
      selectedPhoto.value = null
    },
    onEnter: () => {
      toggleFullScreen()
    },
  })
}

// Navigation function
function navigatePhoto(direction: number) {
  if (!selectedPhoto.value)
    return

  const currentIndex = photos.findIndex(photo => photo.name === selectedPhoto.value?.name)
  const newIndex = currentIndex + direction

  if (newIndex >= 0 && newIndex < photos.length) {
    slideDirection.value = direction > 0 ? 'next' : 'prev'

    // Temporarily show info when switching photos
    if (userHiddenInfo.value) {
      showInfo.value = true
      // Auto hide info after 2.5 seconds
      setTimeout(() => {
        const targetPhoto = photos[newIndex]
        if (selectedPhoto.value?.name === targetPhoto?.name) {
          showInfo.value = false
        }
      }, 2500)
    }

    selectedPhoto.value = photos[newIndex] || null
  }
}

// Calculate current photo position
const currentPhotoIndex = computed(() => {
  if (!selectedPhoto.value)
    return -1
  return photos.findIndex(photo => photo.name === selectedPhoto.value?.name)
})

const totalPhotos = computed(() => photos.length)

// Preview photo click handler
function selectPreviewPhoto(photo: typeof photos[number]) {
  const newIndex = photos.findIndex(p => p.name === photo.name)
  const currentIndex = currentPhotoIndex.value

  if (newIndex !== currentIndex) {
    slideDirection.value = newIndex > currentIndex ? 'next' : 'prev'

    // Temporarily show info when switching photos
    if (userHiddenInfo.value) {
      showInfo.value = true
      // Auto hide info after 2.5 seconds
      setTimeout(() => {
        if (selectedPhoto.value?.name === photo.name) {
          showInfo.value = false
        }
      }, 2500)
    }

    selectedPhoto.value = { ...photo }
  }
}

// Toggle info display on image click
function toggleInfo() {
  showInfo.value = !showInfo.value
  userHiddenInfo.value = !showInfo.value
}

// Listen for keyboard events
watch(selectedPhoto, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handlePhotoKeydown)
  }
  else {
    document.removeEventListener('keydown', handlePhotoKeydown)
  }
})
</script>

<template>
  <div p4 grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 gap-1">
    <div v-for="photo in photos" :key="photo.name" aspect-square bg-neutral:10 @click="selectedPhoto = photo">
      <LazyNuxtImg
        loading="lazy"
        :quality="70"
        :width="720"
        :src="photo.url"
        alt="photo"
        w-full
        h-full
        object-cover
        :style="getBlurhashStyle(photo.name)"
      />
    </div>
    <DialogRoot v-model:open="isDialogOpen">
      <DialogPortal>
        <DialogOverlay
          class="fixed inset-0 bg-black/50 backdrop-blur-lg transition-opacity duration-300"
          @click="selectedPhoto = null"
        />
        <DialogContent
          class="fixed inset-0 flex outline-none" @pointer-down-outside="selectedPhoto = null"
          @escape-key-down="selectedPhoto = null"
        >
          <div class="flex justify-center items-center w-full h-full">
            <!-- Top control buttons -->
            <div class="absolute right-4 top-4 z-20 flex gap-2">
              <!-- Fullscreen button (hidden on mobile) -->
              <button
                class="size-10 justify-center items-center flex aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full hidden sm:flex"
                @click="toggleFullScreen"
              >
                <Icon :name="isFullscreen ? 'ph:arrows-in-simple' : 'ph:arrows-out-simple'" />
                <span class="sr-only">{{ isFullscreen ? 'Exit fullscreen' : 'Fullscreen' }}</span>
              </button>

              <!-- Close button -->
              <DialogClose
                class="size-10 justify-center items-center flex aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                @click="selectedPhoto = null"
              >
                <Icon name="carbon:close" />
                <span class="sr-only">Close</span>
              </DialogClose>
            </div>

            <!-- Left navigation button -->
            <button
              v-if="currentPhotoIndex > 0"
              class="absolute  left-4 z-10 flex items-center justify-center w-16 h-16 opacity-0 hover:opacity-30 transition-all duration-300 bg-black/20 backdrop-blur-sm rounded-full"
              lg="h-80 w-50" @click.stop="navigatePhoto(-1)"
            >
              <Icon name="carbon:chevron-left" size-24 class="text-white" />
              <span class="sr-only">Previous photo</span>
            </button>

            <!-- Right navigation button -->
            <button
              v-if="currentPhotoIndex < photos.length - 1"
              class="absolute right-4 z-10 flex items-center justify-center w-16 h-16 opacity-0 hover:opacity-30 transition-all duration-300 bg-black/20 backdrop-blur-sm rounded-full"
              lg="h-80 w-50" @click.stop="navigatePhoto(1)"
            >
              <Icon name="carbon:chevron-right" size-24 class="text-white" />
              <span class="sr-only">Next photo</span>
            </button>

            <!-- Main content area - Image -->
            <div class="relative w-full h-full flex items-center justify-center" @click="toggleInfo">
              <Transition :name="slideDirection === 'next' ? 'photo-slide' : 'photo-slide-reverse'" mode="out-in">
                <div :key="selectedPhoto?.name" :style="getBlurhashStyle(selectedPhoto?.name)">
                  <NuxtImg
                    v-slot="{ isLoaded, src, imgAttrs }" :src="selectedPhoto?.url" alt="photo"
                    class="rounded-lg shadow-2xl" :custom="true"
                  >
                    <img v-if="isLoaded" v-bind="imgAttrs" :src class="max-w-90vw max-h-80vh object-contain">
                    <div v-else class="flex items-center justify-center w-full h-64">
                      <Icon name="svg-spinners:bars-fade" size-40 class="text-neutral-400" />
                    </div>
                  </NuxtImg>
                </div>
              </Transition>
            </div>

            <!-- Bottom control bar -->
            <Transition name="info-fade">
              <div
                v-if="showInfo"
                class="absolute bottom-4 rounded-lg flex flex-col gap-4 p-4 bg-gradient-to-t from-black/20 to-transparent"
              >
                <!-- Photo info -->
                <div class="flex justify-between items-center text-white/50 text-sm px-2">
                  <div class="flex items-center gap-2">
                    <span>{{ selectedPhoto?.name }}</span>
                    <span class="text-xs opacity-60">
                      {{ currentPhotoIndex + 1 }} / {{ totalPhotos }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4">
                    <!-- Navigation buttons -->
                    <button
                      v-if="photos.findIndex(photo => photo.name === selectedPhoto?.name) > 0"
                      class="flex size-10 justify-center items-center aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                      @click="navigatePhoto(-1)"
                    >
                      <Icon name="carbon:chevron-left" />
                      <span class="sr-only">Previous photo</span>
                    </button>
                    <button
                      v-if="photos.findIndex(photo => photo.name === selectedPhoto?.name) < photos.length - 1"
                      class="flex justify-center items-center size-10 aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                      @click="navigatePhoto(1)"
                    >
                      <Icon name="carbon:chevron-right" />
                      <span class="sr-only">Next photo</span>
                    </button>
                  </div>
                </div>

                <!-- Preview images -->
                <div>
                  <PhotoPreview
                    :photos="photos"
                    :current-photo-index="currentPhotoIndex"
                    :select-preview-photo="selectPreviewPhoto"
                  />
                </div>

                <!-- Operation hints -->
                <div class="text-center text-xs text-white/60 px-2">
                  <span class="hidden sm:inline">Use ← → keys to navigate, click image to toggle info</span>
                  <span class="sm:hidden">Click image to toggle info</span>
                </div>
              </div>
            </Transition>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<style scoped>
.info-fade-enter-active,
.info-fade-leave-active {
  transition: all 0.3s ease;
}

.info-fade-enter-from,
.info-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
