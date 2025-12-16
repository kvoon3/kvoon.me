import { redis, REDIS_KEYS } from '#shared/redis'

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

  const result = await logoutUser(username, token)
    .catch((error: any) => {
      console.error('Database error in logout:', error)
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
 * User logout
 */
async function logoutUser(username: string, token: string) {
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)
  await redis.del(tokenKey)

  // Clear online status
  await redis.del(REDIS_KEYS.ONLINE_USER(username))

  return { success: true }
}
