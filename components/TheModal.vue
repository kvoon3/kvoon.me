<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const isOpen = shallowRef(false)
</script>

<template>
  <div>
    <button @click="isOpen = true">
      {{ props.name }}
    </button>
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="isOpen" class="fixed inset-0 z-50">
          <!-- 遮罩层 -->
          <div
            class="fixed inset-0 bg-black/50 transition-opacity"
            @click="isOpen = false"
          />

          <!-- 模态框内容 -->
          <div class="fixed inset-0 flex items-center justify-center p-4">
            <div class="relative bg-base rounded-lg shadow-xl max-w-lg w-full p-6 border">
              <!-- 关闭按钮 -->
              <button
                class="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                @click="isOpen = false"
              >
                <span class="sr-only">关闭</span>
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <slot />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
