<script setup lang="ts">
const props = defineProps<{
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: number
    isStreaming?: boolean
  }
}>()

const formattedTime = computed(() => {
  return new Date(props.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})
</script>

<template>
  <div
    class="w-full animate-fade-in"
    :class="[message.role === 'user' ? 'text-right' : 'text-left']"
    :data-message-id="message.id"
  >
    <div class="text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1" :class="[message.role === 'user' ? 'justify-end' : 'justify-start']">
      <span v-if="message.role === 'assistant'">🤖</span>
      <span>{{ message.role === 'user' ? 'You' : 'kvoon' }}</span>
      <span v-if="message.role === 'assistant'" class="text-xs bg-[#a0f0ec]/20 text-[#00a89d] dark:text-[#a0f0ec] px-1.5 py-0.5 rounded">AI</span>
    </div>
    <div
      class="inline-block max-w-[80%] rounded p-3 transition-all duration-300"
      :class="[
        message.role === 'assistant'
          ? 'bg-[#a0f0ec]/10 dark:bg-[#a0f0ec]/10 text-black dark:text-white border border-[#a0f0ec]/40 dark:border-[#a0f0ec]/40'
          : 'bg-black dark:bg-white text-white dark:text-black',
        message.isStreaming && 'animate-pulse',
      ]"
    >
      <div class="break-words leading-relaxed whitespace-pre-wrap">
        {{ message.content }}
        <span v-if="message.isStreaming" class="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
      </div>
    </div>
    <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
      {{ formattedTime }}
    </div>
  </div>
</template>
