<script setup lang="ts">
import AuthModal from './AuthModal.vue'
import Toast from './Toast.vue'

const {
  newMessage,
  isLoading,
  isSending,
  error,
  formattedMessages,
  otherTypingUsers,
  isAuthenticated,
  username,
  isConnected,
  onlineUsers,

  sendMessage,
  loadMessages,
  cleanup,
  logout,
} = useChat()

const messagesEnd = ref<HTMLElement>()
const showOnlineUsers = ref(false)
const showAuthModal = shallowRef(false)
const showErrorToast = ref(false)

function scrollToBottom() {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'instant' })
    }
  })
}
watch(formattedMessages, () => {
  scrollToBottom()
}, { deep: true })

watch(error, (newError) => {
  if (newError) {
    showErrorToast.value = true
  }
}, { immediate: true })

function handleLogout() {
  logout()
}

function handleTyping(_isTyping: boolean) {
}

onMounted(() => {
  if (isAuthenticated) {
    loadMessages()
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="flex flex-col min-h-0 flex-1">
    <div class="flex justify-between items-center px-6 py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-black dark:text-white m-0">
          Chat
        </h1>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="!isAuthenticated" class="flex items-center gap-3">
          <button
            class="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded hover:opacity-90 transition-opacity"
            @click="showAuthModal = true"
          >
            Sign In
          </button>
        </div>
        <div v-else class="flex items-center gap-3">
          <span class="font-medium text-black dark:text-white">{{ username }}</span>
          <button
            class="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
          <button
            class="px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="showOnlineUsers = true"
          >
            {{ onlineUsers.length }} online
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <div class="w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800">
        <!-- Channel panel will go here -->
        <div class="p-4">
          <h3 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            Channels
          </h3>
          <div class="space-y-1">
            <div class="px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-black dark:text-white">
              #General
            </div>
            <div class="px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-black dark:text-white">
              #Random
            </div>
            <div class="px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-black dark:text-white">
              #@kvoon
            </div>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="isLoading && formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-base">
            Loading...
          </div>

          <div v-else-if="formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-base">
            No messages yet. Start chatting!
          </div>

          <div v-else class="space-y-6">
            <ChatMessage
              v-for="message in formattedMessages"
              :key="message.id"
              :message="message"
            />
          </div>

          <div ref="messagesEnd" class="h-1 shrink-0" />
        </div>

        <div v-if="!isAuthenticated" class="p-6 border-t border-neutral-200 dark:border-neutral-800">
          <div class="text-center py-8">
            <p class="text-neutral-500 dark:text-neutral-400 mb-4">
              Sign in to join the conversation
            </p>
            <button
              class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
              @click="showAuthModal = true"
            >
              Sign In to Chat
            </button>
          </div>
        </div>
        <div v-else class="p-6 border-t border-neutral-200 dark:border-neutral-800">
          <ChatInput
            v-model:message="newMessage"
            :disabled="!isConnected || isLoading"
            :is-sending="isSending"
            :typing-users="otherTypingUsers"
            @send="sendMessage"
            @typing="handleTyping"
          />
        </div>
      </div>
    </div>

    <TheModal v-model:open="showOnlineUsers" title="Online Users" max-width="max-w-md">
      <div class="space-y-3">
        <p class="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          {{ onlineUsers.length }} users online
        </p>
        <div
          v-for="user in onlineUsers"
          :key="user"
          class="flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
        >
          <div class="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold text-sm shrink-0 rounded-full">
            {{ user.charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-black dark:text-white truncate">
              {{ user }}
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
              <span class="text-xs text-neutral-500 dark:text-neutral-400">online</span>
            </div>
          </div>
        </div>
        <div v-if="onlineUsers.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
          No users online
        </div>
      </div>
    </TheModal>
    <AuthModal v-model:open="showAuthModal" />
    <Toast
      v-model:open="showErrorToast"
      :description="error || ''"
      variant="destructive"
    />
  </div>
</template>
