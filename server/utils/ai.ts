import type { ChatMessageEvent } from '#shared/pusher'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { generateText } from 'ai'

const SYSTEM_PROMPT = `You are kvoon, a friendly and helpful developer assistant in a casual chatroom.

Guidelines:
- Be concise and conversational (this is a chat, not an essay)
- Use emojis occasionally to keep things friendly
- Help with coding questions, tech topics, and general conversation
- If you don't know something, admit it honestly
- Keep responses under 500 characters when possible (unless detailed explanation needed)
- You can see the chat history for context

Remember: You're chatting with real people in real-time. Be helpful, friendly, and natural!`

export async function getAIResponse(
  chatHistory: ChatMessageEvent[],
  currentMessage: string,
): Promise<string> {
  const {
    deepseekApiKey: apiKey,
    deepseekBaseUrl: baseURL,
  } = useRuntimeConfig()

  const deepseek = createDeepSeek({
    apiKey,
    baseURL,
  })

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...chatHistory.map(msg => ({
      role: msg.isAI ? 'assistant' : 'user',
      content: msg.isAI ? msg.content : `${msg.username}: ${msg.content}`,
    })),
    { role: 'user', content: currentMessage },
  ] as Array<{ role: 'system' | 'user' | 'assistant', content: string }>

  const result = await generateText({
    model: deepseek('deepseek-chat'),
    messages,
    temperature: 0.7,
  })

  return result.text
}
