import { redis, REDIS_KEYS } from '#shared/redis'

export default defineEventHandler(async (event) => {
  const user = event.context.user

  const result = await logoutUser(user.username, user.token)

  return {
    success: true,
    data: result,
  }
})

/**
 * User logout
 */
async function logoutUser(username: string, token: string) {
  try {
    const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)
    await Promise.all([
      redis.del(tokenKey),
      redis.del(REDIS_KEYS.ONLINE_USER(username)),
    ])

    return { success: true }
  }
  catch (error: any) {
    console.error('Database error in logoutUser:', error)
    throw createError({
      statusCode: 500,
      message: 'Database error occurred',
    })
  }
}
