<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  placeholder?: string
  typingUsers?: string[]
}>()

const emit = defineEmits<{
  send: [message: string]
  typing: [isTyping: boolean]
}>()

const modelValue = defineModel('message', { type: String })

const placeholder = computed(() => {
  return props.placeholder || '输入消息...'
})

const typingHint = computed(() => {
  if (!props.typingUsers || props.typingUsers.length === 0) {
    return ''
  }

  if (props.typingUsers.length === 1) {
    return `${props.typingUsers[0]} 正在输入...`
  }

  if (props.typingUsers.length === 2) {
    return `${props.typingUsers[0]} 和 ${props.typingUsers[1]} 正在输入...`
  }

  return `${props.typingUsers[0]} 等 ${props.typingUsers.length} 人正在输入...`
})

let typingTimeout: NodeJS.Timeout | null = null

function handleInputChange() {
  // 触发正在输入事件
  emit('typing', true)

  // 清除之前的定时器
  if (typingTimeout) {
    clearTimeout(typingTimeout)
  }

  // 3秒后停止正在输入状态
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

  // 清除正在输入状态
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
      <div class="flex rounded-lg overflow-hidden">
        <input
          v-model="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex-1 px-4 py-3 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          @input="handleInputChange"
        >
        <button
          type="submit"
          :disabled="disabled || !modelValue?.trim()"
          class="px-6 py-3 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          发送
        </button>
      </div>
      <div v-if="typingHint" class="text-sm text-neutral-500 dark:text-neutral-400 h-5">
        {{ typingHint }}
      </div>
    </form>
  </div>
</template>
