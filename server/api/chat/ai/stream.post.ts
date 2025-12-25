import type { UIMessage } from 'ai'
import { MESSAGE_TTL, redis, REDIS_KEYS } from '#shared/redis'
import { convertToModelMessages, streamText } from 'ai'

const AI_SYSTEM_PROMPT = `You are kvoon, a helpful and friendly AI assistant in a private 1-on-1 chat.

Guidelines:
- Be conversational and natural in your responses
- Help with coding questions, tech topics, and general conversation
- Use emojis occasionally to keep things friendly
- If you don't know something, admit it honestly
- Remember context from previous messages in this conversation
- Keep responses clear and concise unless detailed explanation is needed

You're chatting directly with the user in a private conversation. Be helpful, friendly, and engaging!`

export default defineLazyEventHandler(async () => {
  const model = getAIModel()

  return defineEventHandler(async (event) => {
    const { username } = event.context.user
    const { messages }: { messages: UIMessage[] } = await readBody(event).catch((error: any) => {
      throw createError({
        statusCode: 400,
        message: `Invalid JSON body: ${error.message}`,
      })
    })

    if (!messages || !Array.isArray(messages)) {
      throw createError({
        statusCode: 400,
        message: 'Messages array is required',
      })
    }

    try {
      const userMessage = messages[messages.length - 1]
      if (!userMessage) {
        throw createError({
          statusCode: 400,
          message: 'No message provided',
        })
      }

      const messageId = await redis.incr(REDIS_KEYS.AI_LAST_MESSAGE_ID(username))
      const timestamp = Date.now()

      await redis.zadd(REDIS_KEYS.AI_CONTEXT(username), {
        score: timestamp,
        member: JSON.stringify({
          ...userMessage,
          id: `ai_msg_${messageId}`,
          timestamp,
        }),
      })
      await redis.expire(REDIS_KEYS.AI_CONTEXT(username), MESSAGE_TTL)

      const modelMessages = convertToModelMessages(messages)

      const result = streamText({
        model,
        system: AI_SYSTEM_PROMPT,
        messages: modelMessages,
        temperature: 0.7,
        async onFinish({ response }) {
          const aiMessageId = await redis.incr(REDIS_KEYS.AI_LAST_MESSAGE_ID(username))
          const aiTimestamp = Date.now()

          const aiMessage = {
            id: `ai_msg_${aiMessageId}`,
            role: 'assistant' as const,
            parts: response.messages[0]?.content || [],
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

      return result.toUIMessageStreamResponse()
    }
    catch (error: any) {
      console.error('AI stream error:', error)
      throw createError({
        statusCode: 500,
        message: 'Failed to process AI request',
      })
    }
  })
})
