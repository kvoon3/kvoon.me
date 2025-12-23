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
const showCommandHint = ref(false)
const inputRef = ref<HTMLInputElement>()

let typingTimeout: ReturnType<typeof setTimeout> | null = null

function handleInputChange() {
  emit('typing', true)

  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  typingTimeout = setTimeout(() => {
    emit('typing', false)
  }, 3000)

  checkForCommandHint()
}

function checkForCommandHint() {
  const cursorPosition = inputRef.value?.selectionStart ?? 0
  const textBeforeCursor = message.value?.slice(0, cursorPosition) ?? ''
  const lastWord = textBeforeCursor.split(/\s/).pop() ?? ''

  showCommandHint.value = lastWord.startsWith('@') && lastWord.length === 1
}

function insertCommand() {
  if (!message.value) {
    message.value = '@kvoon '
  }
  else {
    const cursorPosition = inputRef.value?.selectionStart ?? 0
    const textBeforeCursor = message.value.slice(0, cursorPosition)
    const textAfterCursor = message.value.slice(cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      message.value = `${textBeforeCursor.slice(0, lastAtIndex)}@kvoon ${textAfterCursor}`
      nextTick(() => {
        const newPosition = lastAtIndex + 7
        inputRef.value?.setSelectionRange(newPosition, newPosition)
        inputRef.value?.focus()
      })
    }
  }

  showCommandHint.value = false
}

function handleSubmit() {
  if (!message.value?.trim() || props.disabled) {
    return
  }

  const msg = message.value.trim()
  emit('send', msg)
  message.value = ''

  emit('typing', false)
  if (typingTimeout) {
    clearTimeout(typingTimeout)
    typingTimeout = null
  }

  showCommandHint.value = false
}

onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }
  emit('typing', false)
})
</script>

<template>
  <div class="w-full relative">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-2 scale-95"
    >
      <div
        v-if="showCommandHint"
        class="absolute bottom-full mb-2 left-0 right-0 flex justify-center"
      >
        <button
          type="button"
          class="group flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          @click="insertCommand"
        >
          <span class="text-2xl group-hover:scale-110 transition-transform duration-200">🤖</span>
          <div class="flex flex-col items-start">
            <span class="text-sm font-medium text-black dark:text-white">@kvoon</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400">Ask AI assistant</span>
          </div>
          <kbd class="hidden sm:inline-flex ml-2 px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded">Tab</kbd>
        </button>
      </div>
    </Transition>

    <form class="flex flex-col gap-2" @submit.prevent="handleSubmit">
      <div class="flex rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 focus-within:shadow-highlight">
        <input
          ref="inputRef"
          v-model="message"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white border-none focus:outline-none caret-[#a0f0eccd]"
          @input="handleInputChange"
          @keydown.tab.prevent="showCommandHint && insertCommand()"
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
