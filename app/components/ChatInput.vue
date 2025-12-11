<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  placeholder?: string
  typingUsers?: string[]
  isSending?: boolean
}>()

const emit = defineEmits<{
  send: [message: string]
  typing: [isTyping: boolean]
}>()

const modelValue = defineModel('message', { type: String })

const placeholder = computed(() => {
  return props.placeholder || 'Type a message...'
})

const typingHint = computed(() => {
  if (!props.typingUsers || props.typingUsers.length === 0) {
    return ''
  }

  if (props.typingUsers.length === 1) {
    return `${props.typingUsers[0]} is typing...`
  }

  if (props.typingUsers.length === 2) {
    return `${props.typingUsers[0]} and ${props.typingUsers[1]} are typing...`
  }

  return `${props.typingUsers[0]} and ${props.typingUsers.length - 1} others are typing...`
})

let typingTimeout: NodeJS.Timeout | null = null

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
  if (!modelValue.value?.trim() || props.disabled) {
    return
  }

  const msg = modelValue.value.trim()
  emit('send', msg)
  modelValue.value = ''

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
      <div class="flex rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700">
        <input
          v-model="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white border-none focus:outline-none"
          @input="handleInputChange"
        >
        <button
          type="submit"
          :disabled="disabled || !modelValue?.trim() || isSending"
          class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-none focus:outline-none flex items-center justify-center gap-2"
        >
          <span v-if="isSending" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
          <span>{{ isSending ? 'Sending...' : 'Send' }}</span>
        </button>
      </div>
      <div v-if="typingHint" class="text-sm text-neutral-500 dark:text-neutral-400 h-5">
        {{ typingHint }}
      </div>
    </form>
  </div>
</template>
