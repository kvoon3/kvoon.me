import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const socketId = body.socket_id as string
  const channelName = body.channel_name as string

  // Get headers for authentication
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!socketId || !channelName) {
    throw createError({
      statusCode: 400,
      message: 'Missing required Pusher parameters',
    })
  }

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: 'Missing authentication information',
    })
  }

  // Verify token
  const authResult = await verifyToken(username, token)
    .catch((error: any) => {
      console.error('Database error in pusher auth:', error)
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

  // For presence channels, need to provide user data
  const presenceData = {
    user_id: username,
    user_info: {
      name: username,
    },
  }

  // Generate authentication response
  const authResponse = pusher?.authorizeChannel(socketId, channelName, presenceData)
  return authResponse
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
