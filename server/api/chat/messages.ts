import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'

export default defineEventHandler(async (event) => {
  // Verify user identity (optional, public chat room doesn't require verification)
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (username && token) {
    const authResult = await verifyToken(username, token)
      .catch((error: any) => {
        console.error('Database error in messages auth:', error)
        throw createError({
          statusCode: 500,
          message: 'Database error occurred',
        })
      })

    if (!authResult.valid) {
      throw createError({
        statusCode: 401,
        message: 'Authentication invalid or expired',
      })
    }
  }

  // Get query parameters
  const query = getQuery(event)
  const limit = Number.parseInt(query.limit as string) || 50
  const offset = Number.parseInt(query.offset as string) || 0

  // Limit maximum count
  const safeLimit = Math.min(limit, 100)
  const safeOffset = Math.max(offset, 0)

  // Get messages
  const messages = await getChatMessages(safeLimit, safeOffset)
    .catch((error: any) => {
      console.error('Database error in get messages:', error)
      throw createError({
        statusCode: 500,
        message: 'Database error occurred',
      })
    })

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
 * Verify token
 */
async function verifyToken(username: string, token: string) {
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)
  const isValid = await redis.get(tokenKey)

  if (isValid) {
    // Automatically renew token
    await redis.expire(tokenKey, TOKEN_TTL)

    // Update online status
    await redis.set(REDIS_KEYS.ONLINE_USER(username), 'online', { ex: 300 })

    return { valid: true }
  }

  return { valid: false }
}

/**
 * Get chat message history
 */
async function getChatMessages(limit: number = 50, offset: number = 0) {
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
