import { redis, REDIS_KEYS, TOKEN_TTL } from '#shared/redis'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
    })
  }

  const result = await loginUser(username, password)

  return {
    success: true,
    data: result,
  }
})

/**
 * User login
 */
async function loginUser(username: string, password: string) {
  // Get stored hashed password
  const hashedPassword = await redis.get<string>(REDIS_KEYS.PASSWORD(username))
  if (!hashedPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User does not exist',
    })
  }

  // Verify password
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Password is incorrect',
    })
  }

  // Generate token
  const token = nanoid(32)
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)

  // Update user last login time
  const userInfo = await redis.get<{ username: string, createdAt: number, lastLogin: number }>(REDIS_KEYS.USER_INFO(username))

  let updatedUserInfo = { username, createdAt: Date.now(), lastLogin: Date.now() }

  if (userInfo && typeof userInfo === 'object') {
    updatedUserInfo = { ...userInfo, lastLogin: Date.now() }
  }

  await Promise.all([
    redis.set(tokenKey, 'valid', { ex: TOKEN_TTL }),
    redis.set(REDIS_KEYS.USER_INFO(username), updatedUserInfo),
    redis.set(REDIS_KEYS.ONLINE_USER(username), 'online', { ex: 300 }),
  ])

  return { success: true, token, username }
}
