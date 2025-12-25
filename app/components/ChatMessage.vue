<script setup lang="ts">
import type { UIMessage } from 'ai'

interface ChatMessageProps {
  id: string
  username?: string
  content?: string
  time?: string
  isOwn?: boolean
  isAI?: boolean
  isPending?: boolean
  role?: 'user' | 'assistant' | 'system'
  timestamp?: number
  isStreaming?: boolean
  parts?: UIMessage['parts']
}

const props = defineProps<{
  message: ChatMessageProps
}>()

const formattedTime = computed(() => {
  if (props.message.time)
    return props.message.time
  if (props.message.timestamp) {
    return new Date(props.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  return ''
})

const displayName = computed(() => {
  if (props.message.username)
    return props.message.username
  if (props.message.role === 'user')
    return 'You'
  if (props.message.role === 'assistant')
    return 'kvoon'
  return ''
})

const isAIMessage = computed(() => {
  return props.message.isAI || props.message.role === 'assistant'
})

const isOwnMessage = computed(() => {
  return props.message.isOwn || props.message.role === 'user'
})

const messageContent = computed(() => {
  if (props.message.content) {
    return props.message.content
  }

  if (props.message.parts) {
    return props.message.parts
      .filter(part => part.type === 'text')
      .map(part => part.type === 'text' ? part.text : '')
      .join('')
  }

  return ''
})
</script>

<template>
  <div
    class="w-full animate-fade-in"
    :class="[isAIMessage ? 'text-left' : isOwnMessage ? 'text-right' : 'text-left']"
    :data-message-id="message.id"
  >
    <div class="text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1" :class="[isAIMessage ? 'justify-start' : isOwnMessage ? 'justify-end' : 'justify-start']">
      <span v-if="isAIMessage">🤖</span>
      <span>{{ displayName }}</span>
      <span v-if="isAIMessage" class="text-xs bg-primary/20 text-[#00a89d] dark:text-primary px-1.5 py-0.5 rounded">AI</span>
    </div>
    <div
      v-if="!isAIMessage"
      class="inline-block max-w-[80%] rounded p-3 transition-all duration-300 relative overflow-hidden bg-neutral-100/70 dark:bg-black text-black dark:text-white"
      :class="[
        message.isPending && 'message-pending',
      ]"
    >
      <div class="break-words leading-relaxed relative z-1">
        {{ messageContent }}
      </div>
    </div>
    <div
      v-else
      class="w-full transition-all duration-300"
    >
      <div class="break-words leading-relaxed whitespace-pre-wrap">
        {{ messageContent }}
        <span v-if="message.isStreaming" class="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
      </div>
    </div>
    <div class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
      {{ formattedTime }}
    </div>
  </div>
</template>
