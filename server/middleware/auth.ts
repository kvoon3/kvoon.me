import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'

export default defineEventHandler(async (event) => {
  // Only intercept API requests, not page routes
  if (!event.path.startsWith('/api/')) {
    return
  }

  // API paths that don't require authentication
  const publicPaths = ['/api/auth/register', '/api/auth/login']
  if (publicPaths.some(path => event.path.startsWith(path))) {
    return
  }

  // For chat message retrieval, allow public access
  if (event.path.startsWith('/api/chat/messages')) {
    return
  }

  // Check authentication headers
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  // Verify token
  const authResult = await verifyToken(username, token)
    .catch((error: any) => {
      console.error('Database error in middleware auth:', error)
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

  // Add user information to event context
  event.context.user = { username }
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
