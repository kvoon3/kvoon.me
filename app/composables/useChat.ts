import { computed, ref, watch } from 'vue'
import { useAuth } from './useAuth'
import { usePusher } from './usePusher'

export function useChat() {
  const auth = useAuth()
  const pusher = usePusher()

  const newMessage = ref('')
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性：格式化消息
  const formattedMessages = computed(() => {
    return pusher.messages.value.map(msg => ({
      ...msg,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: msg.username === auth.username.value,
    }))
  })

  // 计算属性：在线用户数量
  const onlineCount = computed(() => pusher.onlineUsers.value.length)

  // 计算属性：正在输入的用户（排除自己）
  const otherTypingUsers = computed(() => {
    return pusher.typingUsers.value.filter(user => user !== auth.username.value)
  })

  // 发送消息
  const sendMessage = async () => {
    if (!newMessage.value.trim() || !auth.isAuthenticated.value) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      await pusher.sendMessage(newMessage.value)
      newMessage.value = ''
    }
    catch (err: any) {
      error.value = err.message || '发送消息失败'
    }
    finally {
      isLoading.value = false
    }
  }

  // 加载消息历史
  const loadMessages = async () => {
    isLoading.value = true
    try {
      await pusher.fetchMessages(50)
    }
    catch (err: any) {
      console.error('err', err)
      error.value = '加载消息失败'
    }
    finally {
      isLoading.value = false
    }
  }

  // 处理输入变化（设置正在输入状态）
  let typingTimeout: NodeJS.Timeout | null = null
  const handleInput = () => {
    // 设置正在输入状态
    pusher.setTyping(true)

    // 清除之前的定时器
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // 3秒后清除正在输入状态
    typingTimeout = setTimeout(() => {
      pusher.setTyping(false)
    }, 3000)
  }

  // 监听认证状态，自动加载消息
  watch(() => auth.isAuthenticated.value, (authenticated) => {
    if (authenticated) {
      loadMessages()
    }
  })

  // 组件卸载时清理
  const cleanup = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    pusher.setTyping(false)
  }

  return {
    // 状态
    newMessage,
    isLoading,
    error,
    formattedMessages,
    onlineCount,
    otherTypingUsers,
    isAuthenticated: auth.isAuthenticated,
    username: auth.username,

    // Pusher 状态
    isConnected: pusher.isConnected,
    onlineUsers: pusher.onlineUsers,

    // 方法
    sendMessage,
    loadMessages,
    handleInput,
    cleanup,

    // 认证方法
    login: auth.setAuth,
    logout: auth.logout,
  }
}
