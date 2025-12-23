<script setup lang="ts">
defineProps<{
  message: {
    username: string
    content: string
    time: string
    isOwn: boolean
    isAI?: boolean
  }
}>()
</script>

<template>
  <div class="w-full animate-fade-in" :class="[message.isAI ? 'text-left' : message.isOwn ? 'text-right' : 'text-left']">
    <div class="text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1" :class="[message.isAI ? 'justify-start' : message.isOwn ? 'justify-end' : 'justify-start']">
      <span v-if="message.isAI">🤖</span>
      <span>{{ message.username }}</span>
      <span v-if="message.isAI" class="text-xs bg-[#a0f0ec]/20 text-[#00a89d] dark:text-[#a0f0ec] px-1.5 py-0.5 rounded">AI</span>
    </div>
    <div
      class="inline-block max-w-[80%] rounded p-3"
      :class="[
        message.isAI
          ? 'bg-[#a0f0ec]/10 dark:bg-[#a0f0ec]/10 text-black dark:text-white border border-[#a0f0ec]/40 dark:border-[#a0f0ec]/40'
          : message.isOwn
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
