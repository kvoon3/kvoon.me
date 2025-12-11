<script setup lang="ts">
const {
  // 状态
  newMessage,
  isLoading,
  error,
  formattedMessages,
  otherTypingUsers,
  isAuthenticated,
  username,
  isConnected,
  onlineUsers,

  // 方法
  sendMessage,
  loadMessages,
  cleanup,
  logout,
} = useChat()

const messagesEnd = ref<HTMLElement>()

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'smooth' })
    }
  })
}
watch(formattedMessages, () => {
  scrollToBottom()
}, { deep: true })

// 处理登出
function handleLogout() {
  logout()
  // 可以添加重定向逻辑
}

// 处理正在输入
function handleTyping(_isTyping: boolean) {
  // 这里可以调用 API 或直接通过 Pusher 发送
  // 已经在 useChat 中处理了
}

// 初始化
onMounted(() => {
  if (isAuthenticated) {
    loadMessages()
  }
})

// 清理
onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="flex flex-col min-h-0 flex-1">
    <div class="flex justify-between items-center px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-neutral-900 dark:text-white m-0">
          Chat
        </h1>
        <div class="border rounded-full px-4 py-1 font-mono text-sm">
          <span class="text-current">{{ isConnected ? 'connected' : 'connecting...' }}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="username" class="flex items-center gap-3">
          <span class="font-medium text-neutral-900 dark:text-white">{{ username }}</span>
          <button @click="handleLogout">
            退出
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden p-6 gap-6">
      <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-neutral-900 rounded-xl shadow-sm relative">
        <div class="flex-1 overflow-y-auto p-6 pb-24">
          <div v-if="error" class="bg-red-500 text-white px-4 py-3 rounded-lg mb-4 text-sm">
            {{ error }}
          </div>

          <div v-if="isLoading && formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-base">
            加载中...
          </div>

          <div v-else-if="formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-base">
            还没有消息，开始聊天吧！
          </div>

          <div v-else class="space-y-4">
            <ChatMessage
              v-for="message in formattedMessages"
              :key="message.id"
              :message="message"
            />
          </div>

          <div ref="messagesEnd" class="h-1 shrink-0" />
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent dark:from-neutral-900 dark:via-neutral-900 dark:to-transparent">
          <ChatInput
            v-model:message="newMessage"
            :disabled="!isConnected || isLoading"
            :typing-users="otherTypingUsers"
            @send="sendMessage"
            @typing="handleTyping"
          />
        </div>
      </div>

      <div class="w-80 shrink-0">
        <OnlineUsers
          :users="onlineUsers"
          :current-user="username || undefined"
        />
      </div>
    </div>
  </div>
</template>
