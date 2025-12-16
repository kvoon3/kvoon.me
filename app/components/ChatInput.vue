<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  placeholder?: string
  typingUsers?: string[]
  isSending?: boolean
}>(), {
  placeholder: 'Type a message...',
})

const emit = defineEmits<{
  send: [message: string]
  typing: [isTyping: boolean]
}>()

const message = defineModel('message', { type: String })

let typingTimeout: ReturnType<typeof setTimeout> | null = null

function handleInputChange() {
  // Trigger typing event
  emit('typing', true)

  // Clear previous timeout
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // Stop typing after 3 seconds
  typingTimeout = setTimeout(() => {
    emit('typing', false)
  }, 3000)
}

function handleSubmit() {
  if (!message.value?.trim() || props.disabled) {
    return
  }

  const msg = message.value.trim()
  emit('send', msg)
  message.value = ''

  // Clear typing status
  emit('typing', false)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }
}
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  emit('typing', false)
})
</script>

<template>
  <div class="w-full">
    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 focus-within:shadow-highlight">
        <input
          v-model="message"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white border-none focus:outline-none caret-[#a0f0eccd]"
          @input="handleInputChange"
        >
        <button
          type="submit"
          :disabled="disabled || !message?.trim() || isSending"
          class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed rounded-l-none focus:outline-none flex items-center justify-center gap-2"
        >
          <span v-if="isSending" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span>{{ isSending ? 'Sending...' : 'Send' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>
