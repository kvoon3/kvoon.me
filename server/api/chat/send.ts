import type { ChannelId } from '#shared/pusher'
import { getPusherChannelName, PUSHER_EVENTS } from '#shared/pusher'
import { MESSAGE_TTL, redis, REDIS_KEYS } from '#shared/redis'

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

    const msgKey = REDIS_KEYS.MESSAGE(channelId, `msg_${messageId}`)
    await Promise.all([
      redis.set(msgKey, JSON.stringify(message), { ex: MESSAGE_TTL }),
      redis.zadd(REDIS_KEYS.MESSAGES_INDEX(channelId), { score: timestamp, member: `msg_${messageId}` }),
    ])

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
    const recentMessageIds = await redis.zrange(REDIS_KEYS.MESSAGES_INDEX(channelId), -15, -1)
    const hasRecentMessages = recentMessageIds.length > 0

    const recentMessages = hasRecentMessages
      ? await redis.mget(...recentMessageIds.map(id => REDIS_KEYS.MESSAGE(channelId, id as string)))
      : []

    const chatHistory = recentMessages
      .map((msg) => {
        try {
          return msg ? (typeof msg === 'string' ? JSON.parse(msg) : msg) : null
        }
        catch {
          return null
        }
      })
      .filter(Boolean)

    const messageWithoutMention = userMessage.replace(/^@kvoon\s*/i, '').trim()

    const aiResponseText = await getAIResponse(
      chatHistory,
      messageWithoutMention || hasRecentMessages
        ? messageWithoutMention
        : 'Hi!',
    )

    const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID(channelId))
    const timestamp = Date.now()

    const aiMessage = {
      id: `msg_${messageId}`,
      username: 'kvoon',
      content: aiResponseText,
      timestamp,
      channelId,
      isAI: true,
    }

    const msgKey = REDIS_KEYS.MESSAGE(channelId, `msg_${messageId}`)
    await Promise.all([
      redis.set(msgKey, JSON.stringify(aiMessage), { ex: MESSAGE_TTL }),
      redis.zadd(REDIS_KEYS.MESSAGES_INDEX(channelId), { score: timestamp, member: `msg_${messageId}` }),
    ] as const)

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

      const msgKey = REDIS_KEYS.MESSAGE(channelId, `msg_${messageId}`)
      await Promise.all([
        redis.set(msgKey, JSON.stringify(errorMessage), { ex: MESSAGE_TTL }),
        redis.zadd(REDIS_KEYS.MESSAGES_INDEX(channelId), { score: timestamp, member: `msg_${messageId}` }),
      ] as const)

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
