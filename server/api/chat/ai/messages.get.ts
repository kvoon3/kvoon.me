import type { UIMessage } from 'ai'
import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const { username } = event.context.user

  try {
    const messageIds = await redis.zrange(REDIS_KEYS.AI_CONTEXT_INDEX(username), 0, -1)

    if (!messageIds || messageIds.length === 0) {
      return {
        success: true,
        data: {
          messages: [],
        },
      }
    }

    const messages = await redis.mget(...messageIds.map(id => REDIS_KEYS.AI_MESSAGE(username, id as string)))

    const formattedMessages = messages
      .map((msg) => {
        try {
          return msg ? (typeof msg === 'string' ? JSON.parse(msg) : msg) : null
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
