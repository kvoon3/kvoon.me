import type { UIMessage } from 'ai'
import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const { username } = event.context.user

  try {
    const messages = await redis.zrange(REDIS_KEYS.AI_CONTEXT(username), 0, -1)

    const formattedMessages = messages
      .map((msg) => {
        try {
          return typeof msg === 'string' ? JSON.parse(msg) : msg
        }
        catch {
          return null
        }
      })
      .filter(Boolean) as UIMessage[]

    return {
      success: true,
      data: {
        messages: formattedMessages,
      },
    }
  }
  catch (error: any) {
    console.error('Failed to fetch AI messages:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch messages',
    })
  }
})
