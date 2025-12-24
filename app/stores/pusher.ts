import type { ChannelId, ChatMessageEvent, UserTypingEvent } from '#shared/pusher'
import { getPusherChannelName, PUSHER_EVENTS } from '#shared/pusher'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Pusher from 'pusher-js'

interface ChannelState {
  messages: ChatMessageEvent[]
  onlineUsers: string[]
  typingUsers: string[]
  hasMore: boolean
  isLoadingMore: boolean
}

export const usePusherStore = defineStore('Pusher', () => {
  const auth = useAuth()
  const channel = ref<any>(null)
  const pusher = shallowRef<Pusher | null>(null)

  const isConnected = ref(false)
  const currentChannelId = ref<ChannelId>('GENERAL')
  const channelStates = ref<Record<string, ChannelState>>({})
  const isAIResponding = ref(false)
  let pendingMessageId = 0

  function getChannelState(channelId: ChannelId): ChannelState {
    if (!channelStates.value[channelId]) {
      channelStates.value[channelId] = {
        messages: [],
        onlineUsers: [],
        typingUsers: [],
        hasMore: true,
        isLoadingMore: false,
      }
    }
    return channelStates.value[channelId]
  }

  const messages = computed(() => getChannelState(currentChannelId.value).messages)
  const onlineUsers = computed(() => getChannelState(currentChannelId.value).onlineUsers)
  const typingUsers = computed(() => getChannelState(currentChannelId.value).typingUsers)
  const hasMore = computed(() => getChannelState(currentChannelId.value).hasMore)
  const isLoadingMore = computed(() => getChannelState(currentChannelId.value).isLoadingMore)

  function connect() {
    if (!auth.isAuthenticated.value || !import.meta.browser || pusher.value) {
      return
    }

    const config = useRuntimeConfig()

    if (!config.public.pusherKey || !config.public.pusherCluster) {
      console.warn('Pusher environment variables are not set')
      return
    }

    try {
      const value = new Pusher(config.public.pusherKey, {
        cluster: config.public.pusherCluster,
        channelAuthorization: {
          endpoint: '/api/chat/pusher-auth',
          transport: 'ajax',
          headers: {
            'X-Username': auth.username.value!,
            'X-Token': auth.token.value!,
          },
        },
      })
      pusher.value = value

      // Subscribe to channel
      subscribeToChannel(currentChannelId.value)

      // Monitor connection status
      pusher.value.connection.bind('state_change', (states: any) => {
        isConnected.value = states.current === 'connected'
      })

      // Monitor connection success
      pusher.value.connection.bind('connected', () => {
        isConnected.value = true
      })
    }
    catch (error) {
      console.error('Failed to connect to Pusher:', error)
    }
  }

  function subscribeToChannel(channelId: ChannelId) {
    if (!pusher.value)
      return

    if (channelId === 'AI')
      return

    // Unsubscribe from the old channel
    if (channel.value) {
      channel.value.unbind_all()
      channel.value.unsubscribe()
    }

    const state = getChannelState(channelId)

    // Subscribe to the new channel
    const channelName = getPusherChannelName(channelId)
    if (!channelName)
      return

    channel.value = pusher.value.subscribe(channelName)

    // Monitor subscription errors
    channel.value.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error)
    })

    // Monitor message events
    channel.value.bind(PUSHER_EVENTS.CHAT_MESSAGE, (data: ChatMessageEvent) => {
      if (data.isAI) {
        isAIResponding.value = false
      }

      const pendingIndex = state.messages.findIndex(
        msg => msg.isPending && msg.username === data.username && msg.content === data.content,
      )
      if (pendingIndex !== -1) {
        state.messages.splice(pendingIndex, 1)
      }

      state.messages.push(data)
    })

    // Monitor user join (Pusher presence event)
    channel.value.bind('pusher:member_added', (member: any) => {
      const username = member.id
      if (!state.onlineUsers.includes(username)) {
        state.onlineUsers.push(username)
      }
    })

    // Monitor user leave (Pusher presence event)
    channel.value.bind('pusher:member_removed', (member: any) => {
      const username = member.id
      state.onlineUsers = state.onlineUsers.filter(user => user !== username)
    })

    // Monitor subscription success, get current online users and fetch messages
    channel.value.bind('pusher:subscription_succeeded', async (members: any) => {
      state.onlineUsers = Object.keys(members.members || {})

      // Only fetch messages if channel has no cached messages
      if (state.messages.length === 0) {
        await fetchMessages()
      }
    })

    // Monitor user typing (client event)
    channel.value.bind(`client-${PUSHER_EVENTS.USER_TYPING}`, (data: UserTypingEvent) => {
      if (data.isTyping) {
        if (!state.typingUsers.includes(data.username)) {
          state.typingUsers.push(data.username)
        }
      }
      else {
        state.typingUsers = state.typingUsers.filter(user => user !== data.username)
      }
    })
  }

  function disconnect() {
    if (channel.value) {
      channel.value.unsubscribe()
    }

    if (pusher.value) {
      pusher.value.disconnect()
    }
    pusher.value = null
    channel.value = null
    isConnected.value = false
  }

  async function sendMessage(content: string) {
    if (!auth.isAuthenticated.value) {
      throw new Error('需要认证')
    }

    const trimmedContent = content.trim()
    const isAIMention = trimmedContent.toLowerCase().startsWith('@kvoon')

    const state = getChannelState(currentChannelId.value)

    pendingMessageId += 1
    const optimisticMessage: ChatMessageEvent = {
      id: `pending_${pendingMessageId}`,
      username: auth.username.value!,
      content: trimmedContent,
      timestamp: Date.now(),
      channelId: currentChannelId.value,
      isPending: true,
    }
    state.messages.push(optimisticMessage)

    if (isAIMention) {
      isAIResponding.value = true
    }

    try {
      const response = await $fetch('/api/chat/send', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: { content: trimmedContent, channelId: currentChannelId.value },
      })

      return response
    }
    catch (error) {
      const index = state.messages.findIndex(msg => msg.id === optimisticMessage.id)
      if (index !== -1) {
        state.messages.splice(index, 1)
      }
      if (isAIMention) {
        isAIResponding.value = false
      }
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async function fetchMessages(limit: number = 20) {
    try {
      const options: any = {
        query: { limit, channelId: currentChannelId.value },
      }

      if (auth.isAuthenticated.value) {
        options.headers = auth.getAuthHeaders()
      }

      const response = await $fetch('/api/public/chat/messages', options)

      if (response.success) {
        const state = getChannelState(currentChannelId.value)
        state.messages = response.data.messages
        state.hasMore = response.data.hasMore
      }
    }
    catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  async function loadMoreMessages() {
    const state = getChannelState(currentChannelId.value)

    if (!state.hasMore || state.isLoadingMore) {
      return
    }

    state.isLoadingMore = true

    try {
      const options: any = {
        query: {
          limit: 20,
          offset: state.messages.length,
          channelId: currentChannelId.value,
        },
      }

      if (auth.isAuthenticated.value) {
        options.headers = auth.getAuthHeaders()
      }

      const response = await $fetch('/api/public/chat/messages', options)

      if (response.success) {
        state.messages = [...response.data.messages, ...state.messages]
        state.hasMore = response.data.hasMore
      }
    }
    catch (error) {
      console.error('Failed to load more messages:', error)
    }
    finally {
      state.isLoadingMore = false
    }
  }

  async function switchChannel(channelId: ChannelId) {
    if (currentChannelId.value === channelId) {
      return
    }

    // Clear non-persistent state for old channel
    const oldState = getChannelState(currentChannelId.value)
    oldState.onlineUsers = []
    oldState.typingUsers = []

    currentChannelId.value = channelId

    if (auth.isAuthenticated.value && pusher.value) {
      subscribeToChannel(channelId)
    }
    else {
      await fetchMessages()
    }
  }

  async function setTyping(isTyping: boolean) {
    if (!auth.isAuthenticated.value) {
      return
    }

    try {
      if (channel.value) {
        channel.value.trigger(`client-${PUSHER_EVENTS.USER_TYPING}`, {
          username: auth.username.value,
          isTyping,
        })
      }
    }
    catch (error) {
      console.error('Failed to set typing status:', error)
    }
  }

  watch([auth.isAuthenticated, currentChannelId], (authenticated) => {
    if (authenticated) {
      connect()
    }
    else {
      disconnect()
    }
  }, { immediate: true })

  onUnmounted(() => {
    disconnect()
  })

  return {
    pusher,
    channel,
    isConnected,
    currentChannelId,
    messages,
    onlineUsers,
    typingUsers,
    hasMore,
    isLoadingMore,
    isAIResponding,
    connect,
    disconnect,
    sendMessage,
    fetchMessages,
    loadMoreMessages,
    setTyping,
    switchChannel,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePusherStore, import.meta.hot))
}
