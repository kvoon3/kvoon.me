<script setup lang="ts">
import type { ChannelId } from '#shared/pusher'
import { channels } from '#shared/pusher'

defineProps<{
  currentChannelId: ChannelId
}>()

const emit = defineEmits<{
  switchChannel: [channelId: ChannelId]
}>()

const open = defineModel<boolean>('open', { required: true })

function handleChannelSwitch(channelId: ChannelId) {
  emit('switchChannel', channelId)
  open.value = false
}
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <Transition name="fade">
        <DialogOverlay class="fixed inset-0 bg-black/50 z-50" />
      </Transition>
      <Transition name="slide-down">
        <DialogContent
          class="fixed top-0 left-0 right-0 bg-white dark:bg-neutral-900 rounded-b-xl shadow-xl w-full p-0 z-50 max-h-70vh overflow-y-auto"
        >
          <div class="relative">
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 py-4 px-6">
              <DialogTitle class="text-lg font-semibold text-black dark:text-white">
                Channels
              </DialogTitle>
              <DialogDescription class="sr-only">
                Select a channel to view messages
              </DialogDescription>
              <DialogClose
                class="rounded-full p-1 op50 hover:op75 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
                aria-label="Close"
              >
                <svg
                  class="w-5 h-5 text-neutral-500 dark:text-neutral-400"
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
            </div>

            <!-- Channel list -->
            <div class="p-4">
              <div class="space-y-1">
                <button
                  v-for="channel in channels"
                  :key="channel.id"
                  class="w-full text-left px-4 py-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-black dark:text-white transition-colors"
                  :class="{
                    'bg-neutral-200 dark:bg-neutral-700 font-semibold': currentChannelId === channel.id,
                  }"
                  @click="handleChannelSwitch(channel.id)"
                >
                  #{{ channel.name }}
                </button>
              </div>
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

/* Slide-down transition for drawer */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
