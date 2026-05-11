<script setup lang="ts">
import type { PhotoMeta } from '~/types/photo'
import { blurhashToCssGradientString } from '@unpic/placeholder'
import { parseFilename } from 'ufo'
import { imgRE } from '~/shared/constants'

const props = defineProps<{
  metaMap: Record<string, PhotoMeta>
  displayMode: 'cover' | 'contain'
  activeLocationKeys: string[]
  showInfo: boolean
}>()

const allPhotos = Object.entries(import.meta.glob<{ default: string }>('../../public/photos/*', {
  eager: true,
})).map(([key, _]) => {
  const name = parseFilename(key)!
  return {
    name,
    url: `/photos/${name}`,
  }
}).filter(photo => imgRE.test(photo.name)).reverse()

function getMeta(filename: string): PhotoMeta | undefined {
  return props.metaMap[filename.replace(imgRE, '')]
}

function getPhotoTagLabel(filename: string): string | undefined {
  return getPhotoLocation(getMeta(filename) ?? {})?.label
}

const photos = computed(() => {
  const activeKeys = new Set(props.activeLocationKeys)
  return allPhotos.filter((photo) => {
    const location = getPhotoLocation(getMeta(photo.name) ?? {})
    return location ? activeKeys.has(location.key) : false
  })
})

function getBlurhashStyle(filename: string | undefined): Record<string, string> | undefined {
  const name = filename?.replace(imgRE, '')
  const bg = name ? props.metaMap[name]?.blurhash : undefined
  return bg ? { background: blurhashToCssGradientString(bg) } : undefined
}

const selectedPhoto = shallowRef<typeof allPhotos[number] | null>(null)
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

async function copyPhotoName(photo: typeof allPhotos[number]) {
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

  const idx = photos.value.findIndex(p => p.name === selectedPhoto.value!.name)

  if (e.key === 'ArrowLeft' && idx > 0) {
    const prev = photos.value[idx - 1]
    if (prev)
      selectedPhoto.value = prev
  }
  if (e.key === 'ArrowRight' && idx < photos.value.length - 1) {
    const next = photos.value[idx + 1]
    if (next)
      selectedPhoto.value = next
  }
}

watch(selectedPhoto, (val) => {
  if (val)
    document.addEventListener('keydown', onKeydown)
  else document.removeEventListener('keydown', onKeydown)
})

watch(photos, (value) => {
  if (selectedPhoto.value && !value.some(photo => photo.name === selectedPhoto.value?.name))
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
      v-if="photos.length === 0"
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
    <TransitionGroup name="photo-grid" tag="div" p4 grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 gap-4">
      <div
        v-for="photo in photos"
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
          :style="props.displayMode === 'cover' ? getBlurhashStyle(photo.name) : ''"
        />
        <Transition name="photo-info">
          <div
            v-if="props.showInfo && getPhotoTagLabel(photo.name)"
            absolute bottom-0 left-0 right-0 bg-black:60 text-white text-xs px-2 py-1 truncate
          >
            {{ getPhotoTagLabel(photo.name) }}
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
