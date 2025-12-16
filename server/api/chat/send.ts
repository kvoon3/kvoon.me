import { PUSHER_CHANNELS, PUSHER_EVENTS } from '#shared/pusher'
import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'

export default defineEventHandler(async (event) => {
  // Verify user identity
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: 'Missing authentication information',
    })
  }

  const authResult = await verifyToken(username, token)
    .catch((error: any) => {
      console.error('Database error in send message auth:', error)
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

  // Read message content
  let body
  try {
    body = await readBody(event)
  }
  catch (error: any) {
    throw createError({
      statusCode: 400,
      message: `Invalid JSON body: ${error.message}`,
    })
  }

  const { content } = body

  if (!content || !content.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Message content cannot be empty',
    })
  }

  // Send message
  const message = await sendChatMessage(username, content)
    .catch((error: any) => {
      console.error('Database error in send message:', error)
      throw createError({
        statusCode: 500,
        message: 'Database error occurred',
      })
    })

  // Trigger Pusher event
  await pusher.trigger(PUSHER_CHANNELS.PRESENCE_CHATROOM, PUSHER_EVENTS.CHAT_MESSAGE, message)
    .catch((error: any) => {
      console.error('Pusher error in send message:', error)
      // Don't throw error for Pusher failure, just log it
    })

  return {
    success: true,
    data: message,
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
 * Send chat message
 */
async function sendChatMessage(username: string, content: string) {
  if (!content.trim()) {
    throw new Error('Message content cannot be empty')
  }

  // Generate message ID
  const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID)
  const timestamp = Date.now()

  const message = {
    id: `msg_${messageId}`,
    username,
    content: content.trim(),
    timestamp,
  }

  // Store to Redis Sorted Set (using timestamp as score)
  await redis.zadd(REDIS_KEYS.MESSAGES, { score: timestamp, member: JSON.stringify(message) })

  // Limit message history count (keep recent 1000 messages)
  // Temporarily commented out, testing basic functionality first
  // await redis.zremrangebyrank(REDIS_KEYS.MESSAGES, 0, -1001)

  return message
}
