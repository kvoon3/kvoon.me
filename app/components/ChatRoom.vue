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

const messagesEnd = ref<HTMLElement>()
const showOnlineUsers = ref(false)
const showAuthModal = shallowRef(false)
const showErrorToast = ref(false)
const showChannelDrawer = ref(false)
const oldestVisibleMessageId = ref<string | null>(null)

async function handleChannelSwitch(channelId: ChannelId) {
  if (currentChannelId.value === channelId)
    return
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
  if (oldestVisibleMessageId.value) {
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

onMounted(() => {
  if (isAuthenticated.value) {
    loadMessages().then(() => {
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
        <!-- Mobile menu button -->
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
      <div class="flex items-center gap-2 md:gap-4">
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
            class="px-2 md:px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-xs md:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
          <button
            class="px-2 md:px-3 py-1 border border-neutral-300 dark:border-neutral-700 rounded text-xs md:text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            @click="showOnlineUsers = true"
          >
            {{ onlineUsers.length }} <span class="hidden sm:inline">online</span>
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
          <div v-if="isLoading && formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            Loading...
          </div>

          <div v-else-if="formattedMessages.length === 0" class="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400 text-sm md:text-base">
            No messages yet. Start chatting!
          </div>

          <div v-else class="space-y-4 md:space-y-6">
            <!-- Load More button -->
            <div v-if="hasMore" class="flex justify-center">
              <button
                :disabled="isLoadingMore"
                class="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                @click="handleLoadMore"
              >
                {{ isLoadingMore ? 'Loading...' : 'Load more' }}
              </button>
            </div>

            <ChatMessage
              v-for="message in formattedMessages"
              :key="message.id"
              :message="message"
            />

            <!-- AI placeholder message -->
            <div v-if="isAIResponding" class="w-full animate-fade-in text-left">
              <div class="text-sm font-medium text-black dark:text-white mb-1 flex items-center gap-1 justify-start">
                <span>🤖</span>
                <span>kvoon</span>
                <span class="text-xs bg-[#a0f0ec]/20 text-[#00a89d] dark:text-[#a0f0ec] px-1.5 py-0.5 rounded">AI</span>
              </div>
              <div class="inline-block max-w-[80%] rounded p-3 bg-[#a0f0ec]/10 dark:bg-[#a0f0ec]/10 text-black dark:text-white border border-[#a0f0ec]/40 dark:border-[#a0f0ec]/40 animate-pulse">
                <div class="flex items-center gap-2">
                  <div class="i-svg-spinners:wind-toy text-2xl text-[#00a89d] dark:text-[#a0f0ec]" />
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
    <AuthModal v-model:open="showAuthModal" />
    <Toast
      v-model:open="showErrorToast"
      :description="error || ''"
      variant="destructive"
    />
  </div>
</template>
