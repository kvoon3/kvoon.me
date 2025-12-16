import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: 'Missing authentication information',
    })
  }

  const result = await verifyToken(username, token)
    .catch((error: any) => {
      console.error('Database error in verify:', error)
      throw createError({
        statusCode: 500,
        message: 'Database error occurred',
      })
    })

  return {
    success: true,
    data: result,
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
