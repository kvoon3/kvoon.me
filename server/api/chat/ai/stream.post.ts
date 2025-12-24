import { MESSAGE_TTL, redis, REDIS_KEYS } from '#shared/redis'
import { streamText } from 'ai'

const AI_SYSTEM_PROMPT = `You are kvoon, a helpful and friendly AI assistant in a private 1-on-1 chat.

Guidelines:
- Be conversational and natural in your responses
- Help with coding questions, tech topics, and general conversation
- Use emojis occasionally to keep things friendly
- If you don't know something, admit it honestly
- Remember context from previous messages in this conversation
- Keep responses clear and concise unless detailed explanation is needed

You're chatting directly with the user in a private conversation. Be helpful, friendly, and engaging!`

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default defineEventHandler(async (event) => {
  const { username } = event.context.user
  const { content } = await readBody<{ content: string }>(event).catch((error: any) => {
    throw createError({
      statusCode: 400,
      message: `Invalid JSON body: ${error.message}`,
    })
  })

  if (!content?.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Message content cannot be empty',
    })
  }

  const trimmedContent = content.trim()

  try {
    const messageId = await redis.incr(REDIS_KEYS.AI_LAST_MESSAGE_ID(username))
    const timestamp = Date.now()

    const userMessage: AIMessage = {
      id: `ai_msg_${messageId}`,
      role: 'user',
      content: trimmedContent,
      timestamp,
    }

    await redis.zadd(REDIS_KEYS.AI_CONTEXT(username), {
      score: timestamp,
      member: JSON.stringify(userMessage),
    })
    await redis.expire(REDIS_KEYS.AI_CONTEXT(username), MESSAGE_TTL)

    const recentMessages = await redis.zrange(REDIS_KEYS.AI_CONTEXT(username), -15, -1)
    const chatHistory = recentMessages
      .map((msg) => {
        try {
          return typeof msg === 'string' ? JSON.parse(msg) : msg
        }
        catch {
          return null
        }
      })
      .filter(Boolean) as AIMessage[]

    const messages = [
      { role: 'system', content: AI_SYSTEM_PROMPT },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ] as Array<{ role: 'system' | 'user' | 'assistant', content: string }>

    const result = streamText({
      model: getAIModel(),
      messages,
      temperature: 0.7,
      async onFinish({ text }) {
        const aiMessageId = await redis.incr(REDIS_KEYS.AI_LAST_MESSAGE_ID(username))
        const aiTimestamp = Date.now()

        const aiMessage: AIMessage = {
          id: `ai_msg_${aiMessageId}`,
          role: 'assistant',
          content: text,
          timestamp: aiTimestamp,
        }

        await redis.zadd(REDIS_KEYS.AI_CONTEXT(username), {
          score: aiTimestamp,
          member: JSON.stringify(aiMessage),
        })
        await redis.expire(REDIS_KEYS.AI_CONTEXT(username), MESSAGE_TTL)

        const allMessages = await redis.zcard(REDIS_KEYS.AI_CONTEXT(username))
        if (allMessages > 30) {
          const toRemove = allMessages - 30
          await redis.zremrangebyrank(REDIS_KEYS.AI_CONTEXT(username), 0, toRemove - 1)
        }
      },
    })

    return result.toTextStreamResponse()
  }
  catch (error: any) {
    console.error('AI stream error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process AI request',
    })
  }
})
