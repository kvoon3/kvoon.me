import type { ChannelId, ChatMessageEvent, UserTypingEvent } from '#shared/pusher'
import { getPusherChannelName, PUSHER_EVENTS } from '#shared/pusher'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Pusher from 'pusher-js'

export const usePusherStore = defineStore('Pusher', () => {
  const auth = useAuth()
  const channel = ref<any>(null)
  const pusher = shallowRef<Pusher | null>(null)

  const isConnected = ref(false)
  const currentChannelId = ref<ChannelId>('GENERAL')
  const messages = ref<ChatMessageEvent[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<string[]>([])

  function connect() {
    if (!auth.isAuthenticated.value || !import.meta.browser || pusher.value) {
      return
    }

    const config = useRuntimeConfig()
    const pusherKey = config.public.pusherKey
    const pusherCluster = config.public.pusherCluster

    if (!pusherKey || !pusherCluster) {
      console.warn('Pusher environment variables are not set')
      return
    }

    try {
      const value = new Pusher(pusherKey, {
        cluster: pusherCluster,
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

    // Unsubscribe from the old channel
    if (channel.value) {
      channel.value.unbind_all()
      channel.value.unsubscribe()
    }

    // Reset state
    messages.value = []
    onlineUsers.value = []
    typingUsers.value = []

    // Subscribe to the new channel
    const channelName = getPusherChannelName(channelId)
    channel.value = pusher.value.subscribe(channelName)

    // Monitor subscription errors
    channel.value.bind('pusher:subscription_error', (error: any) => {
      console.error('Pusher subscription error:', error)
    })

    // Monitor message events
    channel.value.bind(PUSHER_EVENTS.CHAT_MESSAGE, (data: ChatMessageEvent) => {
      messages.value.push(data)
    })

    // Monitor user join (Pusher presence event)
    channel.value.bind('pusher:member_added', (member: any) => {
      const username = member.id
      if (!onlineUsers.value.includes(username)) {
        onlineUsers.value.push(username)
      }
    })

    // Monitor user leave (Pusher presence event)
    channel.value.bind('pusher:member_removed', (member: any) => {
      const username = member.id
      onlineUsers.value = onlineUsers.value.filter(user => user !== username)
    })

    // Monitor subscription success, get current online users and fetch messages
    channel.value.bind('pusher:subscription_succeeded', async (members: any) => {
      // Initialize online users list
      onlineUsers.value = Object.keys(members.members || {})

      await fetchMessages()
    })

    // Monitor user typing (client event)
    channel.value.bind(`client-${PUSHER_EVENTS.USER_TYPING}`, (data: UserTypingEvent) => {
      if (data.isTyping) {
        if (!typingUsers.value.includes(data.username)) {
          typingUsers.value.push(data.username)
        }
      }
      else {
        typingUsers.value = typingUsers.value.filter(user => user !== data.username)
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

    try {
      const response = await $fetch('/api/chat/send', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
        body: { content, channelId: currentChannelId.value },
      })

      return response
    }
    catch (error) {
      console.error('Failed to send message:', error)
      throw error
    }
  }

  async function fetchMessages(limit: number = 50) {
    try {
      const options: any = {
        query: { limit, channelId: currentChannelId.value },
      }

      // Only send auth headers when user is authenticated
      if (auth.isAuthenticated.value) {
        options.headers = auth.getAuthHeaders()
      }

      const response = await $fetch('/api/public/chat/messages', options)

      if (response.success) {
        messages.value = response.data.messages
      }
    }
    catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  async function switchChannel(channelId: ChannelId) {
    if (currentChannelId.value === channelId) {
      return
    }

    currentChannelId.value = channelId
    subscribeToChannel(channelId)
    // fetchMessages will be called in pusher:subscription_succeeded event
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
    connect,
    disconnect,
    sendMessage,
    fetchMessages,
    setTyping,
    switchChannel,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePusherStore, import.meta.hot))
}
