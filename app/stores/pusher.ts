import type { ChatMessageEvent, UserTypingEvent } from '#shared/pusher'
import { PUSHER_CHANNELS, PUSHER_EVENTS } from '#shared/pusher'
import { acceptHMRUpdate, defineStore } from 'pinia'
import Pusher from 'pusher-js'

export const usePusherStore = defineStore('Pusher', () => {
  const auth = useAuth()
  const channel = ref<any>(null)
  const pusher = ref<Pusher | null>(null)
  const isConnected = ref(false)
  const messages = ref<ChatMessageEvent[]>([])
  const onlineUsers = ref<string[]>([])
  const typingUsers = ref<string[]>([])

  connect()

  function connect() {
    if (!auth.isAuthenticated.value || !import.meta.browser) {
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
      pusher.value = new Pusher(pusherKey, {
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

      // 订阅频道
      channel.value = pusher.value.subscribe(PUSHER_CHANNELS.PRESENCE_CHATROOM)

      // 监听连接状态
      pusher.value.connection.bind('state_change', (states: any) => {
        isConnected.value = states.current === 'connected'
      })

      // 监听连接成功
      pusher.value.connection.bind('connected', () => {
        isConnected.value = true
      })

      // 监听订阅错误
      channel.value.bind('pusher:subscription_error', (error: any) => {
        console.error('Pusher subscription error:', error)
      })

      // 监听消息事件
      channel.value.bind(PUSHER_EVENTS.CHAT_MESSAGE, (data: ChatMessageEvent) => {
        messages.value.push(data)
      })

      // 监听用户加入（Pusher presence 事件）
      channel.value.bind('pusher:member_added', (member: any) => {
        const username = member.id
        if (!onlineUsers.value.includes(username)) {
          onlineUsers.value.push(username)
        }
      })

      // 监听用户离开（Pusher presence 事件）
      channel.value.bind('pusher:member_removed', (member: any) => {
        const username = member.id
        onlineUsers.value = onlineUsers.value.filter(user => user !== username)
      })

      // 监听订阅成功，获取当前在线用户
      channel.value.bind('pusher:subscription_succeeded', (members: any) => {
        // 初始化在线用户列表
        onlineUsers.value = Object.keys(members.members || {})
      })

      // 监听用户正在输入（客户端事件）
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
    catch (error) {
      console.error('Failed to connect to Pusher:', error)
    }
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
        body: { content },
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
        query: { limit },
      }

      // 只有在用户已认证时才发送认证头
      if (auth.isAuthenticated.value) {
        options.headers = auth.getAuthHeaders()
      }

      const response = await $fetch('/api/chat/messages', options)

      if (response.success) {
        messages.value = response.data.messages
      }
    }
    catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  async function setTyping(isTyping: boolean) {
    if (!auth.isAuthenticated.value) {
      return
    }

    try {
      // 这里可以调用 API 或直接通过 Pusher 发送
      // 简化处理：直接通过 Pusher 发送
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

  watch(() => auth.isAuthenticated.value, (authenticated) => {
    if (authenticated) {
      connect()
    }
    else {
      disconnect()
    }
  })

  // onUnmounted(() => {
  //   disconnect()
  // })

  return {
    pusher,
    channel,
    isConnected,
    messages,
    onlineUsers,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    fetchMessages,
    setTyping,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(usePusherStore, import.meta.hot))
}
