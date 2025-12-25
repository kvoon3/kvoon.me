<script setup lang="ts">
import type { ChannelId } from '#shared/pusher'
import { channels } from '#shared/pusher'
import AuthModal from './AuthModal.vue'
import ChannelDrawer from './ChannelDrawer.vue'
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
  currentChannelId,
  isAIResponding,
  hasMore,
  isLoadingMore,

  sendMessage,
  loadMessages,
  loadMoreMessages,
  cleanup,
  logout,
  switchChannel,
} = useChat()

const aiChatStore = useAIChatStore()
const { messages: aiMessages, isLoading: aiIsLoading, isSending: aiIsSending, isStreaming: aiIsStreaming } = storeToRefs(aiChatStore)

const isAIChannel = computed(() => currentChannelId.value === 'AI')

const displayMessages = computed(() => {
  if (isAIChannel.value) {
    return aiMessages.value
  }
  return formattedMessages.value
})

const messagesEnd = ref<HTMLElement>()
const showOnlineUsers = ref(false)
const showAuthModal = shallowRef(false)
const showErrorToast = ref(false)
const showChannelDrawer = ref(false)
const oldestVisibleMessageId = ref<string | null>(null)
const newAIMessage = ref('')

async function handleChannelSwitch(channelId: ChannelId) {
  if (currentChannelId.value === channelId)
    return

  if (channelId === 'AI' && isAuthenticated.value) {
    await aiChatStore.fetchMessages()
  }

  await switchChannel(channelId)
  nextTick(() => {
    scrollToBottom()
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEnd.value) {
      messagesEnd.value.scrollIntoView({ behavior: 'instant' })
    }
  })
}

watch(formattedMessages, (newMessages, oldMessages) => {
  if (isAIChannel.value || oldestVisibleMessageId.value) {
    return
  }

  if (!oldMessages || newMessages.length > oldMessages.length) {
    const isNewMessageAtEnd = oldMessages
      && newMessages.length > 0
      && oldMessages.length > 0
      && newMessages[newMessages.length - 1]?.id !== oldMessages[oldMessages.length - 1]?.id

    if (!oldMessages || isNewMessageAtEnd) {
      scrollToBottom()
    }
  }
}, { deep: true })

watch(aiMessages, () => {
  if (isAIChannel.value) {
    scrollToBottom()
  }
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

async function handleLoadMore() {
  const firstMessage = formattedMessages.value[0]
  if (firstMessage) {
    oldestVisibleMessageId.value = firstMessage.id
  }

  await loadMoreMessages()

  nextTick(() => {
    if (oldestVisibleMessageId.value) {
      const element = document.querySelector(`[data-message-id="${oldestVisibleMessageId.value}"]`)
      if (element) {
        element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }
      oldestVisibleMessageId.value = null
    }
  })
}

async function handleAISendMessage() {
  if (!newAIMessage.value?.trim()) {
    return
  }

  const msg = newAIMessage.value.trim()
  await aiChatStore.sendMessage(msg)
  newAIMessage.value = ''
}

const showClearConfirm = ref(false)

async function handleClearAIHistory() {
  showClearConfirm.value = true
}

async function confirmClearHistory() {
  try {
    await aiChatStore.clearHistory()
    showClearConfirm.value = false
  }
  catch (error) {
    console.error('Failed to clear history:', error)
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    (isAIChannel.value
      ? aiChatStore.fetchMessages()
      : loadMessages()
    ).then(() => {
      nextTick(() => {
        scrollToBottom()
      })
    })
  }
})

onUnmounted(() => {
  cleanup()
})
</script>

<template>
  <div class="flex flex-col min-h-0 flex-1">
    <div class="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div class="flex items-center gap-2 md:gap-4">
        <button
          aria-label="Open channels"
          class="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          @click="showChannelDrawer = true"
        >
          <svg
            class="w-5 h-5 text-black dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 class="text-lg md:text-2xl font-bold text-black dark:text-white m-0">
          #{{ channels.find(c => c.id === currentChannelId)?.name }}
        </h1>
      </div>
      <div class="flex items-center gap-2 md:gap-3">
        <div v-if="!isAuthenticated" class="flex items-center gap-2 md:gap-3">
          <button
            class="px-3 md:px-4 py-1.5 md:py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm md:text-base hover:opacity-90 transition-opacity"
            @click="showAuthModal = true"
          >
            Sign In
          </button>
        </div>
        <div v-else class="flex items-center gap-2 md:gap-3">
          <span class="font-medium text-black dark:text-white text-sm md:text-base hidden sm:inline">{{ username }}</span>
          <button
            v-if="isAIChannel"
            class="px-2 md:px-3 py-1 text-xs border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="handleClearAIHistory"
          >
            Clear History
          </button>
          <button
            v-if="!isAIChannel"
            class="px-2 md:px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-xs md:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="showOnlineUsers = true"
          >
            <span color-primary>{{ onlineUsers.length }}</span> <span class="hidden sm:inline">online</span>
          </button>
          <button
            class="px-2 md:px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-xs md:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </div>

    <div class="flex flex-1 min-h-0 overflow-hidden">
      <!-- Desktop sidebar - hidden on mobile -->
      <div class="hidden md:block w-64 shrink-0 border-r border-neutral-200 dark:border-neutral-800">
        <!-- Channel panel -->
        <div class="p-4">
          <h3 class="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            Channels
          </h3>
          <div class="space-y-1">
            <button
              v-for="channel in channels"
              :key="channel.id"
              class="w-full text-left px-3 py-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer text-black dark:text-white transition-colors"
              :class="{
                'bg-neutral-200 dark:bg-neutral-700 font-semibold': currentChannelId === channel.id,
              }"
              @click="handleChannelSwitch(channel.id)"
            >
              #{{ channel.name }}
            </button>
          </div>
        </div>
      </div>

      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto p-4 md:p-6">
          <div v-if="(isAIChannel ? aiIsLoading : isLoading) && displayMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            Loading...
          </div>

          <div v-else-if="displayMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            <div class="text-center">
              <div v-if="isAIChannel" class="space-y-2">
                <div class="text-2xl">
                  🤖
                </div>
                <div>Start a conversation with AI!</div>
                <div class="text-xs">
                  Your conversations are private and stored securely.
                </div>
              </div>
              <div v-else>
                No messages yet. Start chatting!
              </div>
            </div>
          </div>

          <div v-else class="space-y-4 md:space-y-6">
            <div v-if="hasMore && !isAIChannel" class="flex justify-center">
              <button
                :disabled="isLoadingMore"
                class="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleLoadMore"
              >
                {{ isLoadingMore ? 'Loading...' : 'Load more' }}
              </button>
            </div>

            <template v-if="isAIChannel">
              <ChatMessage
                v-for="message in aiMessages"
                :key="message.id"
                :message="message"
              />
            </template>
            <template v-else>
              <ChatMessage
                v-for="message in formattedMessages"
                :key="message.id"
                :message="message"
              />
            </template>

            <div v-if="isAIResponding && !isAIChannel" class="w-full animate-fade-in text-left">
              <div class="text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1 justify-start">
                <span>🤖</span>
                <span>kvoon</span>
                <span class="text-xs bg-primary/20 text-[#00a89d] dark:text-primary px-1.5 py-0.5 rounded">AI</span>
              </div>
              <div class="inline-block max-w-[80%] rounded p-3 bg-primary/10 dark:bg-primary/10 text-black dark:text-white border border-primary/40 dark:border-primary/40 animate-pulse">
                <div class="flex items-center gap-2">
                  <div class="i-svg-spinners:wind-toy text-2xl text-[#00a89d] dark:text-primary" />
                  <span class="text-neutral-500 dark:text-neutral-400">Thinking...</span>
                </div>
              </div>
            </div>
          </div>

          <div ref="messagesEnd" class="h-1 shrink-0" />
        </div>

        <div v-if="!isAuthenticated" class="p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-800">
          <div class="text-center py-6 md:py-8">
            <p class="text-neutral-500 dark:text-neutral-400 mb-4 text-sm md:text-base">
              Sign in to join the conversation
            </p>
            <button
              class="px-4 md:px-6 py-2 md:py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm md:text-base hover:opacity-90 transition-opacity"
              @click="showAuthModal = true"
            >
              Sign In to Chat
            </button>
          </div>
        </div>
        <div v-else class="p-4 md:p-6 border-t border-neutral-200 dark:border-neutral-800">
          <ChatInput
            v-if="!isAIChannel"
            v-model:message="newMessage"
            :disabled="!isConnected || isLoading"
            :is-sending="isSending"
            :typing-users="otherTypingUsers"
            @send="sendMessage"
            @typing="handleTyping"
          />
          <div v-else class="flex flex-col gap-2">
            <form class="flex rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 focus-within:shadow-highlight" @submit.prevent="handleAISendMessage">
              <input
                v-model="newAIMessage"
                :disabled="aiIsSending || aiIsStreaming"
                placeholder="Ask AI anything..."
                class="flex-1 px-4 py-3 bg-white dark:bg-neutral-900 text-black dark:text-white border-none focus:outline-none caret-primary"
              >
              <button
                type="submit"
                :disabled="aiIsSending || aiIsStreaming || !newAIMessage?.trim()"
                class="px-6 py-3 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 disabled:opacity-75 disabled:cursor-not-allowed rounded-l-none focus:outline-none flex items-center justify-center gap-2"
              >
                <span v-if="aiIsSending || aiIsStreaming" class="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                <span v-else>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile channel drawer -->
    <ChannelDrawer
      v-model:open="showChannelDrawer"
      :current-channel-id="currentChannelId"
      @switch-channel="handleChannelSwitch"
    />

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

    <TheModal v-model:open="showClearConfirm" title="Clear Chat History" max-width="max-w-md">
      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          Are you sure you want to clear your AI chat history? This action cannot be undone.
        </p>
        <div class="flex gap-3 justify-end">
          <button
            class="px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
            @click="showClearConfirm = false"
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            @click="confirmClearHistory"
          >
            Clear History
          </button>
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
