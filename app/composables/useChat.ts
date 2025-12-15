import { computed, ref, watch } from 'vue'
import { useAuth } from './useAuth'

export function useChat() {
  const auth = useAuth()
  const pusher = usePusherStore()
  const { messages, onlineUsers, typingUsers, isConnected } = storeToRefs(pusher)

  const newMessage = ref('')
  const isLoading = ref(false)
  const isSending = ref(false)
  const error = ref<string | null>(null)

  // Formatted messages
  const formattedMessages = computed(() => {
    return messages.value.map(msg => ({
      ...msg,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: msg.username === auth.username.value,
    }))
  })

  // Online user count
  const onlineCount = computed(() => onlineUsers.value.length)

  // Typing users (excluding self)
  const otherTypingUsers = computed(() => {
    return typingUsers.value.filter(user => user !== auth.username.value)
  })

  // Send message
  const sendMessage = async () => {
    if (!newMessage.value.trim() || !auth.isAuthenticated.value) {
      return
    }

    isSending.value = true
    error.value = null

    try {
      await pusher.sendMessage(newMessage.value)
      newMessage.value = ''
    }
    catch (err: any) {
      error.value = err.message || 'Failed to send message'
    }
    finally {
      isSending.value = false
    }
  }

  // Load message history
  const loadMessages = async () => {
    isLoading.value = true
    try {
      await pusher.fetchMessages(50)
    }
    catch (err: any) {
      console.error('err', err)
      error.value = 'Failed to load messages'
    }
    finally {
      isLoading.value = false
    }
  }

  // Handle input changes (set typing status)
  let typingTimeout: NodeJS.Timeout | null = null
  const handleInput = () => {
    // Set typing status
    pusher.setTyping(true)

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }

    // Clear typing status after 3 seconds
    typingTimeout = setTimeout(() => {
      pusher.setTyping(false)
    }, 3000)
  }

  // Watch authentication status, auto-load messages
  watch(() => auth.isAuthenticated.value, (authenticated) => {
    if (authenticated) {
      loadMessages()
    }
  })

  // Cleanup on component unmount
  const cleanup = () => {
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    pusher.setTyping(false)
  }

  return {
    // State
    newMessage,
    isLoading,
    isSending,
    error,
    formattedMessages,
    onlineCount,
    otherTypingUsers,
    isAuthenticated: auth.isAuthenticated,
    username: auth.username,

    // Pusher state
    isConnected,
    onlineUsers,

    // Methods
    sendMessage,
    loadMessages,
    handleInput,
    cleanup,

    // Auth methods
    login: auth.setAuth,
    logout: auth.logout,
  }
}
