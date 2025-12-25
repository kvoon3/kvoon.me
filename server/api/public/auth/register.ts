import { redis, REDIS_KEYS } from '#shared/redis'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password cannot be empty',
    })
  }

  // Username length restriction
  if (username.length < 3 || username.length > 20) {
    throw createError({
      statusCode: 400,
      message: 'Username must be between 3-20 characters',
    })
  }

  // Password length restriction
  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Password must be at least 6 characters',
    })
  }

  const result = await registerUser(username, password)

  return {
    success: true,
    data: result,
  }
})

/**
 * User registration
 */
async function registerUser(username: string, password: string) {
  // Check if user already exists
  const exists = await redis.get(REDIS_KEYS.PASSWORD(username))
  if (exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Account already exists',
    })
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Store password and user info
  await Promise.all([
    redis.set(REDIS_KEYS.PASSWORD(username), hashedPassword),
    redis.set(REDIS_KEYS.USER_INFO(username), {
      username,
      createdAt: Date.now(),
      lastLogin: Date.now(),
    }),
  ])

  return { success: true, username }
}
