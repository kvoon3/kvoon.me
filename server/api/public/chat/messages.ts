import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  // Get query parameters
  const query = getQuery(event)
  const limit = Number.parseInt(query.limit as string) || 50
  const offset = Number.parseInt(query.offset as string) || 0

  // Limit maximum count
  const safeLimit = Math.min(limit, 100)
  const safeOffset = Math.max(offset, 0)

  // Get messages
  const messages = await getChatMessages(safeLimit, safeOffset)

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

/**
 * Get chat message history
 */
async function getChatMessages(limit: number = 50, offset: number = 0) {
  try {
    // Get latest messages (sorted by timestamp descending)
    // Upstash Redis uses zrange with REV option
    const messages = await redis.zrange(REDIS_KEYS.MESSAGES, offset, offset + limit - 1, { rev: true })

    // If messages is empty array or undefined, return empty array
    if (!messages || !Array.isArray(messages)) {
      return []
    }

    const parsedMessages = messages
      .map((msg) => {
        try {
          if (typeof msg === 'string') {
            return JSON.parse(msg)
          }
          else if (msg && typeof msg === 'object') {
            // If already an object, return directly
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

    return parsedMessages.reverse() // Reverse back to chronological order
  }
  catch (error: any) {
    console.error('Database error in getChatMessages:', error)
    throw createError({
      statusCode: 500,
      message: 'Database error occurred',
    })
  }
}
