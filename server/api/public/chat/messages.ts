import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number.parseInt(query.limit as string) || 20
  const offset = Number.parseInt(query.offset as string) || 0
  const channelId = (query.channelId as string) || 'GENERAL'

  const safeLimit = Math.min(limit, 100)
  const safeOffset = Math.max(offset, 0)

  const messages = await getChatMessages(channelId, safeLimit, safeOffset)

  return {
    success: true,
    data: {
      messages,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: messages.length === safeLimit,
    },
  }
})

async function getChatMessages(channelId: string, limit: number = 50, offset: number = 0) {
  try {
    const messageIds = await redis.zrange(REDIS_KEYS.MESSAGES_INDEX(channelId), offset, offset + limit - 1, { rev: true })

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return []
    }

    const messages = await redis.mget(...messageIds.map(id => REDIS_KEYS.MESSAGE(channelId, id as string)))

    const parsedMessages = messages
      .map((msg) => {
        try {
          if (typeof msg === 'string') {
            return JSON.parse(msg)
          }
          else if (msg && typeof msg === 'object') {
            return msg
          }
          return null
        }
        catch (error) {
          console.warn('Failed to parse message:', msg, error)
          return null
        }
      })
      .filter(Boolean)

    return parsedMessages.reverse()
  }
  catch (error: any) {
    console.error('Database error in getChatMessages:', error)
    throw createError({
      statusCode: 500,
      message: 'Database error occurred',
    })
  }
}
