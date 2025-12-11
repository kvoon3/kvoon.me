<script setup lang="ts">
defineProps<{
  message: {
    username: string
    content: string
    time: string
    isOwn: boolean
  }
}>()
</script>

<template>
  <div
    rounded-lg p-4 w-fit mb-4 shadow-sm
    :class="[
      message.isOwn
        ? 'ml-auto bg-blue-500 text-white'
        : 'mr-auto bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white',
    ]"
  >
    <div class="flex justify-between items-center mb-2 text-sm">
      <div class="font-semibold border px-2 py-0.5 rounded text-xs">
        {{ message.username }}
      </div>
      <span class="opacity-70 text-xs">{{ message.time }}</span>
    </div>
    <div class="break-words leading-relaxed">
      {{ message.content }}
    </div>
  </div>
</template>
