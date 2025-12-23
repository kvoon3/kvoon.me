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

  const pusherChannel = getPusherChannelName(channelId as ChannelId)
  if (pusherChannel) {
    await pusher.trigger(pusherChannel, PUSHER_EVENTS.CHAT_MESSAGE, message)
      .catch((error: any) => {
        console.error('Pusher error in send message:', error)
      })
  }

  if (content.trim().toLowerCase().startsWith('@kvoon')) {
    processAIResponse(channelId, content).catch((error) => {
      console.error('AI response error:', error)
    })
  }

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

async function processAIResponse(channelId: string, userMessage: string) {
  try {
    const recentMessages = await redis.zrange(REDIS_KEYS.MESSAGES(channelId), -15, -1)

    const chatHistory = recentMessages
      .map((msg) => {
        try {
          return typeof msg === 'string' ? JSON.parse(msg) : msg
        }
        catch {
          return null
        }
      })
      .filter(Boolean)

    const messageWithoutMention = userMessage.replace(/^@kvoon\s*/i, '').trim()

    if (!messageWithoutMention) {
      return
    }

    const aiResponse = await getAIResponse(chatHistory, messageWithoutMention)

    const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID(channelId))
    const timestamp = Date.now()

    const aiMessage = {
      id: `msg_${messageId}`,
      username: 'kvoon',
      content: aiResponse,
      timestamp,
      channelId,
      isAI: true,
    }

    await redis.zadd(REDIS_KEYS.MESSAGES(channelId), {
      score: timestamp,
      member: JSON.stringify(aiMessage),
    })

    const pusherChannel = getPusherChannelName(channelId as ChannelId)
    if (pusherChannel) {
      await pusher.trigger(pusherChannel, PUSHER_EVENTS.CHAT_MESSAGE, aiMessage)
    }
  }
  catch (error: any) {
    console.error('Failed to process AI response:', error)

    try {
      const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID(channelId))
      const timestamp = Date.now()

      const errorMessage = {
        id: `msg_${messageId}`,
        username: 'kvoon',
        content: 'Sorry, I\'m having trouble responding right now 🤖 Please try again in a moment.',
        timestamp,
        channelId,
        isAI: true,
      }

      await redis.zadd(REDIS_KEYS.MESSAGES(channelId), {
        score: timestamp,
        member: JSON.stringify(errorMessage),
      })

      const pusherChannel = getPusherChannelName(channelId as ChannelId)
      if (pusherChannel) {
        await pusher.trigger(pusherChannel, PUSHER_EVENTS.CHAT_MESSAGE, errorMessage)
      }
    }
    catch (fallbackError) {
      console.error('Failed to send error message:', fallbackError)
    }
  }
}
