<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

interface Photo {
  name: string
  url: string
}

const props = defineProps<{
  photos: Photo[]
  currentPhotoIndex: number
  selectPreviewPhoto: (photo: Photo) => void
}>()

const containerRef = ref<HTMLDivElement>()

// 计算每个图片的透明度
function getOpacityClass(index: number) {
  const distanceFromCenter = Math.abs(index - props.currentPhotoIndex)

  // 根据距离中心的远近设置不同的透明度
  switch (distanceFromCenter) {
    case 0:
      return 'opacity-100' // 选中图片完全可见
    case 1:
      return 'opacity-80' // 相邻图片稍暗
    case 2:
      return 'opacity-60' // 再远一些更暗
    case 3:
      return 'opacity-40' // 更远
    default:
      return 'opacity-20' // 最远的图片最暗
  }
}

// 计算每个图片的缩放效果（轻微缩放，不要macOS风格）
function getScaleClass(index: number) {
  const distanceFromCenter = Math.abs(index - props.currentPhotoIndex)

  if (distanceFromCenter === 0) {
    return 'scale-105' // 选中图片轻微放大
  }
  return 'scale-100' // 其他图片正常大小
}

// 确保当前图片在滚动区域内可见
function scrollToCurrentPhoto() {
  if (!containerRef.value)
    return

  const items = containerRef.value.querySelectorAll('div[data-photo-index]')
  const currentItem = items[props.currentPhotoIndex]

  if (!currentItem)
    return

  // 使用 scrollIntoView 确保当前图片在可视区域内
  currentItem.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'center',
  })
}

// 监听当前图片索引变化，自动滚动
watch(() => props.currentPhotoIndex, () => {
  nextTick(() => {
    scrollToCurrentPhoto()
  })
})

// 组件挂载后确保当前图片可见
onMounted(() => {
  nextTick(() => {
    scrollToCurrentPhoto()
  })
})
</script>

<template>
  <div class="flex justify-center">
    <div
      ref="containerRef"
      class="flex gap-2 overflow-x-auto py-2 px-4 max-w-2xl custom-scrollbar"
    >
      <div
        v-for="(photo, index) in photos"
        :key="photo.name"
        :data-photo-index="index"
        class="shrink-0 cursor-pointer transition-all relative rounded-lg ransition-transform duration-200"
        :class="[
          getOpacityClass(index),
          getScaleClass(index),
          index === currentPhotoIndex ? 'ring-2 ring-white/50' : '',
        ]"
        @click="selectPreviewPhoto(photo)"
      >
        <!-- 预览图片 -->
        <div class="relative">
          <LazyNuxtImg
            :src="photo.url"
            :alt="`预览图 ${index + 1}`"
            class="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
            loading="lazy"
            :quality="20"
            :width="60"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
