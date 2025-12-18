<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  showClose?: boolean
  maxWidth?: string
}>(), {
  showClose: true,
})

const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="fade">
        <DialogOverlay class="fixed inset-0 bg-black/50 z-50" />
      </Transition>
      <Transition name="slide-up">
        <DialogContent
          class="fixed position-center bg-base rounded-lg shadow-xl w-full p-0 z-50"
          :class="maxWidth || 'max-w-sm'"
        >
          <div class="relative">
            <!-- Header with title -->
            <div v-if="title" class="flex items-center justify-center border-b border-gray-200 dark:border-gray-800 py-3 px-6">
              <DialogTitle class="text-lg font-semibold text-black dark:text-white">
                {{ title }}
              </DialogTitle>
              <DialogDescription v-show="false">
                <!-- Description for screen readers -->
              </DialogDescription>
            </div>

            <!-- Close button -->
            <DialogClose
              v-if="showClose !== false"
              class="absolute top-3.5 right-3 rounded-full p-1 op50 hover:op75 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 z-10"
              aria-label="Close"
            >
              <svg
                class="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </DialogClose>

            <!-- Content -->
            <div class="p-6">
              <slot />
            </div>
          </div>
        </DialogContent>
      </Transition>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* Fade transition for overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide-up transition for modal */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}
</style>
