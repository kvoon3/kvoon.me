import { PUSHER_CHANNELS, PUSHER_EVENTS } from '#shared/pusher'
import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const { username } = event.context.user
  const { content } = await readBody<{
    content: string
  }>(event).catch((error: any) => {
    throw createError({
      statusCode: 400,
      message: `Invalid JSON body: ${error.message}`,
    })
  })

  const message = await sendChatMessage(username, content)

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
 * Send chat message
 */
async function sendChatMessage(username: string, content: string) {
  if (!content.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Message content cannot be empty',
    })
  }

  try {
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
  catch (error: any) {
    console.error('Database error in sendChatMessage:', error)
    throw createError({
      statusCode: 500,
      message: 'Database error occurred',
    })
  }
}
