<script setup lang="ts">
import type { PhotoGridItem, PhotoMeta } from '~/types/photo'
import { blurhashToCssGradientString } from '@unpic/placeholder'

const props = defineProps<{
  photos: PhotoGridItem[]
  metaMap: Record<string, PhotoMeta>
  displayMode: 'cover' | 'contain'
  showInfo: boolean
}>()

function getPhotoTagLabel(stem: string): string | undefined {
  return getPhotoLocation(props.metaMap[stem] ?? {})?.label
}

function getBlurhashStyle(stem: string): Record<string, string> | undefined {
  const bg = props.metaMap[stem]?.blurhash
  return bg ? { background: blurhashToCssGradientString(bg) } : undefined
}

const selectedPhoto = shallowRef<PhotoGridItem | null>(null)
const copyStatus = ref<{ name: string, copied: boolean }>()
const canCopyPhotoName = import.meta.dev
let copiedTimer: ReturnType<typeof setTimeout> | undefined

async function writeClipboardText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  textarea.setAttribute('readonly', '')
  document.body.append(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

async function copyPhotoName(photo: PhotoGridItem) {
  await writeClipboardText(photo.name)
  copyStatus.value = { name: photo.name, copied: true }
  if (copiedTimer)
    clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copyStatus.value = undefined
  }, 1600)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    selectedPhoto.value = null
    return
  }
  if (!selectedPhoto.value)
    return

  const idx = props.photos.findIndex(p => p.name === selectedPhoto.value!.name)

  if (e.key === 'ArrowLeft' && idx > 0) {
    const prev = props.photos[idx - 1]
    if (prev)
      selectedPhoto.value = prev
  }
  if (e.key === 'ArrowRight' && idx < props.photos.length - 1) {
    const next = props.photos[idx + 1]
    if (next)
      selectedPhoto.value = next
  }
}

watch(selectedPhoto, (val) => {
  if (val)
    document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

watch(() => props.photos, (photos) => {
  if (selectedPhoto.value && !photos.some(photo => photo.name === selectedPhoto.value!.name))
    selectedPhoto.value = null
})

onUnmounted(() => {
  if (copiedTimer)
    clearTimeout(copiedTimer)
})
</script>

<template>
  <div>
    <div
      v-if="props.photos.length === 0"
      p4
      min-h-60
      flex
      items-center
      justify-center
      text-sm
      text-neutral
    >
      No photos selected.
    </div>
    <TransitionGroup name="photo-grid" tag="div" px4 grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 gap-4">
      <div
        v-for="photo in props.photos"
        :key="photo.name"
        relative
        aspect-square
        border
        transition-colors
        :class="props.showInfo ? 'border-neutral-300 dark:border-neutral-700' : 'border-transparent'"
        @click="selectedPhoto = photo"
      >
        <LazyNuxtImg
          loading="lazy"
          :quality="70"
          :width="720"
          :src="photo.url"
          alt="photo"
          w-full
          h-full
          :class="props.displayMode === 'cover' ? 'object-cover' : 'object-contain'"
          :style="props.displayMode === 'cover' ? getBlurhashStyle(photo.stem) : ''"
        />
        <Transition name="photo-info">
          <div
            v-if="props.showInfo && getPhotoTagLabel(photo.stem)"
            absolute bottom-0 left-0 right-0 bg-black:60 text-white text-xs px-2 py-1 truncate
          >
            {{ getPhotoTagLabel(photo.stem) }}
          </div>
        </Transition>
        <ClientOnly v-if="canCopyPhotoName">
          <Transition name="photo-info">
            <button
              v-if="props.showInfo"
              type="button"
              title="Copy photo name"
              aria-label="Copy photo name"
              absolute right-2 bottom-2
              z-1
              h-8 min-w-8
              inline-flex items-center justify-center
              gap-1
              rounded-md
              bg-black:60
              text-white
              text-xs
              op-75
              px-2
              transition
              hover:op-100
              focus-visible:outline-none
              focus-visible:ring-1
              focus-visible:ring-white
              @click.stop="copyPhotoName(photo)"
            >
              <Icon :name="copyStatus?.name === photo.name ? 'ph:check-duotone' : 'ph:copy-duotone'" :size="18" />
              <span v-if="copyStatus?.name === photo.name">Copied</span>
            </button>
          </Transition>
        </ClientOnly>
      </div>
    </TransitionGroup>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedPhoto"
          class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          style="padding: 10px"
          @click.self="selectedPhoto = null"
        >
          <NuxtImg
            :src="selectedPhoto.url"
            alt="photo"
            class="w-full h-full object-contain cursor-pointer"
            @click.stop="selectedPhoto = null"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.photo-grid-move,
.photo-grid-enter-active,
.photo-grid-leave-active {
  transition: opacity 0.32s ease, transform 0.32s ease;
}

.photo-grid-enter-from,
.photo-grid-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

.photo-info-enter-active,
.photo-info-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.photo-info-enter-from,
.photo-info-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
