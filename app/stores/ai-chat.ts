import { acceptHMRUpdate, defineStore } from 'pinia'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isStreaming?: boolean
}

export const useAIChatStore = defineStore('AIChat', () => {
  const auth = useAuth()
  const messages = ref<AIMessage[]>([])
  const isLoading = ref(false)
  const isSending = ref(false)
  const isStreaming = ref(false)
  const currentStreamingMessageId = ref<string | null>(null)

  async function fetchMessages() {
    if (!auth.isAuthenticated.value) {
      return
    }

    isLoading.value = true
    try {
      const response = await $fetch('/api/chat/ai/messages', {
        headers: auth.getAuthHeaders(),
      })

      if (response.success) {
        messages.value = response.data.messages
      }
    }
    catch (error) {
      console.error('Failed to fetch AI messages:', error)
    }
    finally {
      isLoading.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!auth.isAuthenticated.value || !content.trim()) {
      return
    }

    const trimmedContent = content.trim()
    isSending.value = true

    const tempUserMessageId = `temp_user_${Date.now()}`
    const userMessage: AIMessage = {
      id: tempUserMessageId,
      role: 'user',
      content: trimmedContent,
      timestamp: Date.now(),
    }
    messages.value.push(userMessage)

    try {
      const tempAiMessageId = `temp_ai_${Date.now()}`
      const aiMessage: AIMessage = {
        id: tempAiMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      }
      messages.value.push(aiMessage)
      currentStreamingMessageId.value = tempAiMessageId
      isStreaming.value = true

      const response = await fetch('/api/chat/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...auth.getAuthHeaders(),
        },
        body: JSON.stringify({ content: trimmedContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to stream AI response')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        const chunk = decoder.decode(value, { stream: true })
        const messageIndex = messages.value.findIndex(m => m.id === tempAiMessageId)

        if (messageIndex !== -1 && messages.value[messageIndex]) {
          messages.value[messageIndex]!.content += chunk
        }
      }

      const messageIndex = messages.value.findIndex(m => m.id === tempAiMessageId)
      if (messageIndex !== -1 && messages.value[messageIndex]) {
        messages.value[messageIndex]!.isStreaming = false
      }
    }
    catch (error) {
      console.error('Failed to send AI message:', error)

      const aiMessageIndex = messages.value.findIndex(m => m.id === currentStreamingMessageId.value)
      if (aiMessageIndex !== -1 && messages.value[aiMessageIndex]) {
        messages.value[aiMessageIndex]!.content = 'Sorry, I encountered an error. Please try again.'
        messages.value[aiMessageIndex]!.isStreaming = false
      }
    }
    finally {
      isSending.value = false
      isStreaming.value = false
      currentStreamingMessageId.value = null
    }
  }

  async function clearHistory() {
    if (!auth.isAuthenticated.value) {
      return
    }

    try {
      const response = await $fetch('/api/chat/ai/clear', {
        method: 'POST',
        headers: auth.getAuthHeaders(),
      })

      if (response.success) {
        messages.value = []
      }
    }
    catch (error) {
      console.error('Failed to clear AI history:', error)
      throw error
    }
  }

  function reset() {
    messages.value = []
    isLoading.value = false
    isSending.value = false
    isStreaming.value = false
    currentStreamingMessageId.value = null
  }

  return {
    messages,
    isLoading,
    isSending,
    isStreaming,
    currentStreamingMessageId,
    fetchMessages,
    sendMessage,
    clearHistory,
    reset,
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAIChatStore, import.meta.hot))
}
