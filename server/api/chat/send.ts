import type { ChannelId } from '#shared/pusher'
import { getPusherChannelName, PUSHER_EVENTS } from '#shared/pusher'
import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const { username } = event.context.user
  const { content, channelId = 'GENERAL' } = await readBody<{
    content: string
    channelId?: string
  }>(event).catch((error: any) => {
    throw createError({
      statusCode: 400,
      message: `Invalid JSON body: ${error.message}`,
    })
  })

  const message = await sendChatMessage(username, content, channelId)

  // Trigger Pusher event
  const pusherChannel = getPusherChannelName(channelId as ChannelId)
  await pusher.trigger(pusherChannel, PUSHER_EVENTS.CHAT_MESSAGE, message)
    .catch((error: any) => {
      console.error('Pusher error in send message:', error)
    })

  return {
    success: true,
    data: message,
  }
})

async function sendChatMessage(username: string, content: string, channelId: string) {
  if (!content.trim()) {
    throw createError({
      statusCode: 400,
      message: 'Message content cannot be empty',
    })
  }

  try {
    const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID(channelId))
    const timestamp = Date.now()

    const message = {
      id: `msg_${messageId}`,
      username,
      content: content.trim(),
      timestamp,
      channelId,
    }

    await redis.zadd(REDIS_KEYS.MESSAGES(channelId), { score: timestamp, member: JSON.stringify(message) })

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
