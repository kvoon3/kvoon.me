import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const { username } = event.context.user

  try {
    const messageIds = await redis.zrange(REDIS_KEYS.AI_CONTEXT_INDEX(username), 0, -1)

    if (messageIds.length > 0) {
      await redis.del(...messageIds.map(id => REDIS_KEYS.AI_MESSAGE(username, id as string)))
    }

    await redis.del(REDIS_KEYS.AI_CONTEXT_INDEX(username))
    await redis.del(REDIS_KEYS.AI_LAST_MESSAGE_ID(username))

    return {
      success: true,
      message: 'Chat history cleared successfully',
    }
  }
  catch (error: any) {
    console.error('Failed to clear AI chat history:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to clear chat history',
    })
  }
})
