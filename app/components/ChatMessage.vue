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
  <div class="w-full animate-fade-in" :class="[message.isOwn ? 'text-right' : 'text-left']">
    <div class="text-sm font-medium text-black dark:text-white mb-1">
      {{ message.username }}
    </div>
    <div
      class="inline-block max-w-[80%] rounded p-3"
      :class="[
        message.isOwn
          ? 'bg-black dark:bg-white text-white dark:text-black'
          : 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white',
      ]"
    >
      <div class="break-words leading-relaxed">
        {{ message.content }}
      </div>
    </div>
    <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
      {{ message.time }}
    </div>
  </div>
</template>
