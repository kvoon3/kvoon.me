<script setup lang="ts">
import { parseFilename } from 'ufo'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

// 导入组件
const PhotoPreview = defineAsyncComponent(() => import('../components/PhotoPreview.vue'))

const photos = Object.entries(import.meta.glob<{ default: string }>('../../public/photos/*', {
  eager: true,
})).map(([key, _]) => {
  const name = parseFilename(key)
  return {
    name,
    url: `/photos/${name}`,
  }
}).reverse()

const selectedPhoto = shallowRef<typeof photos[number] | null>(null)
const isDialogOpen = computed(() => !!selectedPhoto.value)
const slideDirection = ref<'next' | 'prev'>('next')
const showInfo = ref(true)
const userHiddenInfo = ref(false)
const isFullscreen = ref(false)

// 键盘导航支持
const handleKeydown = (event: KeyboardEvent) => {
  if (!selectedPhoto.value) return

  const currentIndex = photos.findIndex(photo => photo.name === selectedPhoto.value?.name)

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      if (currentIndex > 0) {
        slideDirection.value = 'prev'

        // 切换图片时短暂显示信息
        if (userHiddenInfo.value) {
          showInfo.value = true
          // 2.5秒后自动隐藏信息
          setTimeout(() => {
            const prevPhoto = photos[currentIndex - 1]
            if (selectedPhoto.value?.name === prevPhoto?.name) {
              showInfo.value = false
            }
          }, 2500)
        }

        selectedPhoto.value = photos[currentIndex - 1] || null
      }
      break
    case 'ArrowRight':
      event.preventDefault()
      if (currentIndex < photos.length - 1) {
        slideDirection.value = 'next'

        // 切换图片时短暂显示信息
        if (userHiddenInfo.value) {
          showInfo.value = true
          // 2.5秒后自动隐藏信息
          setTimeout(() => {
            const nextPhoto = photos[currentIndex + 1]
            if (selectedPhoto.value?.name === nextPhoto?.name) {
              showInfo.value = false
            }
          }, 2500)
        }

        selectedPhoto.value = photos[currentIndex + 1] || null
      }
      break
    case 'Escape':
      selectedPhoto.value = null
      break
  }
}

// 导航函数
const navigatePhoto = (direction: number) => {
  if (!selectedPhoto.value) return

  const currentIndex = photos.findIndex(photo => photo.name === selectedPhoto.value?.name)
  const newIndex = currentIndex + direction

  if (newIndex >= 0 && newIndex < photos.length) {
    slideDirection.value = direction > 0 ? 'next' : 'prev'

    // 切换图片时短暂显示信息
    if (userHiddenInfo.value) {
      showInfo.value = true
      // 2.5秒后自动隐藏信息
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

// 计算当前图片位置
const currentPhotoIndex = computed(() => {
  if (!selectedPhoto.value) return -1
  return photos.findIndex(photo => photo.name === selectedPhoto.value?.name)
})

const totalPhotos = computed(() => photos.length)

// 预览图片点击切换
const selectPreviewPhoto = (photo: typeof photos[number]) => {
  const newIndex = photos.findIndex(p => p.name === photo.name)
  const currentIndex = currentPhotoIndex.value

  if (newIndex !== currentIndex) {
    slideDirection.value = newIndex > currentIndex ? 'next' : 'prev'

    // 切换图片时短暂显示信息
    if (userHiddenInfo.value) {
      showInfo.value = true
      // 2.5秒后自动隐藏信息
      setTimeout(() => {
        if (selectedPhoto.value?.name === photo.name) {
          showInfo.value = false
        }
      }, 2500)
    }

    selectedPhoto.value = { ...photo }
  }
}

// 点击图片切换信息显示
const toggleInfo = () => {
  showInfo.value = !showInfo.value
  userHiddenInfo.value = !showInfo.value
}

// 切换全屏模式
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true
    }).catch(err => {
      console.error('全屏失败:', err)
    })
  } else {
    // 退出全屏
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    }).catch(err => {
      console.error('退出全屏失败:', err)
    })
  }
}


// 监听键盘事件
watch(selectedPhoto, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleKeydown)
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }
})

// 处理全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}
</script>

<template>
  <div p4 grid="~ cols-1 sm:cols-2 md:cols-3 lg:cols-4 gap-1">
    <div v-for="photo in photos" :key="photo.name" aspect-square bg-neutral:10 @click="selectedPhoto = photo">
      <LazyNuxtImg loading="lazy" :quality="70" :width="720" :src="photo.url" alt="photo" w-full h-full object-cover />
    </div>
    <DialogRoot v-model:open="isDialogOpen">
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-black/50 backdrop-blur-lg transition-opacity duration-300"
          @click="selectedPhoto = null" />
        <DialogContent class="fixed inset-0 flex outline-none" @pointer-down-outside="selectedPhoto = null"
          @escape-key-down="selectedPhoto = null">
          <div class="flex justify-center items-center w-full h-full">
            <!-- 顶部控制按钮 -->
            <div class="absolute right-4 top-4 z-20 flex gap-2">
              <!-- 全屏按钮 -->
              <button
                class="size-10 justify-center items-center flex aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                @click="toggleFullscreen">
                <Icon :name="isFullscreen ? 'carbon:close-filled' : 'carbon:maximize'" />
                <span class="sr-only">{{ isFullscreen ? '退出全屏' : '全屏' }}</span>
              </button>

              <!-- 关闭按钮 -->
              <DialogClose
                class="size-10 justify-center items-center flex aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                @click="selectedPhoto = null">
                <Icon name="carbon:close" />
                <span class="sr-only">关闭</span>
              </DialogClose>
            </div>

            <!-- 左侧导航按钮 -->
            <button v-if="currentPhotoIndex > 0"
              class="absolute  left-4 z-10 flex items-center justify-center w-16 h-16 opacity-0 hover:opacity-30 transition-all duration-300 bg-black/20 backdrop-blur-sm rounded-full"
              lg="h-80 w-50" @click.stop="navigatePhoto(-1)">
              <Icon name="carbon:chevron-left" size-24 class="text-white" />
              <span class="sr-only">上一张</span>
            </button>

            <!-- 右侧导航按钮 -->
            <button v-if="currentPhotoIndex < photos.length - 1"
              class="absolute right-4 z-10 flex items-center justify-center w-16 h-16 opacity-0 hover:opacity-30 transition-all duration-300 bg-black/20 backdrop-blur-sm rounded-full"
              lg="h-80 w-50" @click.stop="navigatePhoto(1)">
              <Icon name="carbon:chevron-right" size-24 class="text-white" />
              <span class="sr-only">下一张</span>
            </button>

            <!-- 主内容区域 - 图片 -->
            <div @click="toggleInfo" class="relative w-full h-full flex items-center justify-center">

              <Transition :name="slideDirection === 'next' ? 'photo-slide' : 'photo-slide-reverse'" mode="out-in">
                <div :key="selectedPhoto?.name">
                  <NuxtImg v-slot="{ isLoaded, src, imgAttrs }" :src="selectedPhoto?.url" alt="photo"
                    class="rounded-lg shadow-2xl" :custom="true">
                    <img v-if="isLoaded" v-bind="imgAttrs" :src class="max-w-90vw max-h-80vh object-contain">
                    <div v-else class="flex items-center justify-center w-full h-64">
                      <Icon name="svg-spinners:bars-fade" size-40 class="text-neutral-400" />
                    </div>
                  </NuxtImg>
                </div>
              </Transition>
            </div>

            <!-- 底部控制栏 -->
            <div
              class="absolute bottom-4 rounded-lg flex flex-col gap-4 p-4 bg-gradient-to-t from-black/20 to-transparent">
              <!-- 图片信息 -->
              <Transition name="info-fade">
                <div v-if="showInfo" class="flex justify-between items-center text-white/50 text-sm px-2">
                  <div class="flex items-center gap-2">
                    <span>{{ selectedPhoto?.name }}</span>
                    <span class="text-xs opacity-60">
                      {{ currentPhotoIndex + 1 }} / {{ totalPhotos }}
                    </span>
                  </div>
                  <div class="flex items-center gap-4">
                    <!-- 导航按钮 -->
                    <button v-if="photos.findIndex(photo => photo.name === selectedPhoto?.name) > 0"
                      class="flex size-10 justify-center items-center aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                      @click="navigatePhoto(-1)">
                      <Icon name="carbon:chevron-left" />
                      <span class="sr-only">上一张</span>
                    </button>
                    <button v-if="photos.findIndex(photo => photo.name === selectedPhoto?.name) < photos.length - 1"
                      class="flex justify-center items-center size-10 aspect-square bg-black/50 hover:bg-black/70 text-white p-2 transition-all duration-200 backdrop-blur-sm rounded-full"
                      @click="navigatePhoto(1)">
                      <Icon name="carbon:chevron-right" />
                      <span class="sr-only">下一张</span>
                    </button>
                  </div>
                </div>
              </Transition>

              <!-- 预览图片 -->
              <Transition name="info-fade">
                <div v-if="showInfo">
                  <PhotoPreview
                    :photos="photos"
                    :current-photo-index="currentPhotoIndex"
                    :select-preview-photo="selectPreviewPhoto"
                  />
                </div>
              </Transition>

              <!-- 操作提示 -->
              <Transition name="info-fade">
                <div v-if="showInfo" class="text-center text-xs text-white/60 px-2">
                  <span class="hidden sm:inline">使用 ← → 键切换图片，点击图片显示/隐藏信息</span>
                  <span class="sm:hidden">点击图片显示/隐藏信息</span>
                </div>
              </Transition>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>
