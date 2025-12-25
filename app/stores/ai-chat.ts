import type { UIMessage } from 'ai'
import { acceptHMRUpdate, defineStore } from 'pinia'

interface CustomUIMessage extends UIMessage {
  timestamp?: number
  isStreaming?: boolean
}

export const useAIChatStore = defineStore('AIChat', () => {
  const auth = useAuth()
  const messages = ref<CustomUIMessage[]>([])
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
    const userMessage: CustomUIMessage = {
      id: tempUserMessageId,
      role: 'user',
      parts: [{ type: 'text', text: trimmedContent }],
      timestamp: Date.now(),
    }
    messages.value.push(userMessage)

    try {
      const tempAiMessageId = `temp_ai_${Date.now()}`
      const aiMessage: CustomUIMessage = {
        id: tempAiMessageId,
        role: 'assistant',
        parts: [{ type: 'text', text: '' }],
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
        body: JSON.stringify({ messages: messages.value }),
      })

      if (!response.ok) {
        throw new Error('Failed to stream AI response')
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')

        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('0:')) {
            const jsonStr = line.slice(2)
            try {
              const data = JSON.parse(jsonStr)

              if (data.type === 'text-delta' && data.textDelta) {
                const messageIndex = messages.value.findIndex(m => m.id === tempAiMessageId)
                if (messageIndex !== -1 && messages.value[messageIndex]) {
                  const msg = messages.value[messageIndex]!
                  const textPart = msg.parts.find(p => p.type === 'text')
                  if (textPart && textPart.type === 'text') {
                    textPart.text += data.textDelta
                  }
                }
              }
              else if (data.type === 'finish') {
                const messageIndex = messages.value.findIndex(m => m.id === tempAiMessageId)
                if (messageIndex !== -1 && messages.value[messageIndex]) {
                  messages.value[messageIndex]!.isStreaming = false
                }
              }
            }
            catch (error) {
              console.error('Failed to parse stream data:', error)
            }
          }
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
        const msg = messages.value[aiMessageIndex]!
        const textPart = msg.parts.find(p => p.type === 'text')
        if (textPart && textPart.type === 'text') {
          textPart.text = 'Sorry, I encountered an error. Please try again.'
        }
        msg.isStreaming = false
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
