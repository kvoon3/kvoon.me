import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { redis, REDIS_KEYS, TOKEN_TTL } from './redis'

const SALT_ROUNDS = 10

/**
 * 用户注册
 */
export async function registerUser(username: string, password: string) {
  // 检查用户是否已存在
  const exists = await redis.get(REDIS_KEYS.PASSWORD(username))
  if (exists) {
    throw new Error('Account already existed')
  }

  // 哈希密码
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  // 存储密码和用户信息
  await redis.set(REDIS_KEYS.PASSWORD(username), hashedPassword)
  await redis.set(REDIS_KEYS.USER_INFO(username), {
    username,
    createdAt: Date.now(),
    lastLogin: Date.now(),
  })

  return { success: true, username }
}

/**
 * 用户登录
 */
export async function loginUser(username: string, password: string) {
  // 获取存储的哈希密码
  const hashedPassword = await redis.get<string>(REDIS_KEYS.PASSWORD(username))
  if (!hashedPassword) {
    throw new Error('用户不存在')
  }

  // 验证密码
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (!isValid) {
    throw new Error('密码错误')
  }

  // 生成 token
  const token = nanoid(32)
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)

  // 存储 token（带 TTL）
  await redis.set(tokenKey, 'valid', { ex: TOKEN_TTL })

  // 更新用户最后登录时间
  const userInfo = await redis.get<{ username: string, createdAt: number, lastLogin: number }>(REDIS_KEYS.USER_INFO(username))

  let updatedUserInfo = { username, createdAt: Date.now(), lastLogin: Date.now() }

  if (userInfo && typeof userInfo === 'object') {
    // 如果存在用户信息，更新最后登录时间
    updatedUserInfo = { ...userInfo, lastLogin: Date.now() }
  }

  await redis.set(REDIS_KEYS.USER_INFO(username), updatedUserInfo)

  // 设置在线状态
  await redis.set(REDIS_KEYS.ONLINE_USER(username), 'online', { ex: 300 }) // 5分钟

  return { success: true, token, username }
}

/**
 * 验证 token
 */
export async function verifyToken(username: string, token: string) {
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)
  const isValid = await redis.get(tokenKey)

  if (isValid) {
    // 自动续期 token
    await redis.expire(tokenKey, TOKEN_TTL)

    // 更新在线状态
    await redis.set(REDIS_KEYS.ONLINE_USER(username), 'online', { ex: 300 })

    return { valid: true }
  }

  return { valid: false }
}

/**
 * 用户登出
 */
export async function logoutUser(username: string, token: string) {
  const tokenKey = REDIS_KEYS.USER_TOKEN(username, token)
  await redis.del(tokenKey)

  // 清除在线状态
  await redis.del(REDIS_KEYS.ONLINE_USER(username))

  return { success: true }
}

/**
 * 获取在线用户列表
 */
export async function getOnlineUsers() {
  try {
    // 使用 SCAN 命令查找所有 chat:online:* 键
    let cursor = '0'
    const onlineUsers: string[] = []

    do {
      const result = await redis.scan(cursor, {
        match: REDIS_KEYS.ONLINE_USER('*'),
        count: 100,
      })
      cursor = result[0]

      // 提取用户名从键名中
      const keys = result[1]
      for (const key of keys) {
        // 键格式: chat:online:{username}
        const match = key.match(/chat:online:(.+)/)
        if (match && match[1]) {
          onlineUsers.push(match[1])
        }
      }
    } while (cursor !== '0')

    return onlineUsers
  }
  catch (error) {
    console.error('Failed to get online users:', error)
    return []
  }
}

/**
 * 设置用户正在输入状态
 */
export async function setUserTyping(username: string, isTyping: boolean) {
  if (isTyping) {
    await redis.set(REDIS_KEYS.TYPING(username), 'typing', { ex: 3 })
  }
  else {
    await redis.del(REDIS_KEYS.TYPING(username))
  }
}

/**
 * 获取正在输入的用户
 */
export async function getTypingUsers() {
  try {
    // 使用 SCAN 命令查找所有 chat:typing:* 键
    let cursor = '0'
    const typingUsers: string[] = []

    do {
      const result = await redis.scan(cursor, {
        match: REDIS_KEYS.TYPING('*'),
        count: 100,
      })
      cursor = result[0]

      // 提取用户名从键名中
      const keys = result[1]
      for (const key of keys) {
        // 键格式: chat:typing:{username}
        const match = key.match(/chat:typing:(.+)/)
        if (match && match[1]) {
          typingUsers.push(match[1])
        }
      }
    } while (cursor !== '0')

    return typingUsers
  }
  catch (error) {
    console.error('Failed to get typing users:', error)
    return []
  }
}

/**
 * 发送聊天消息
 */
export async function sendChatMessage(username: string, content: string) {
  if (!content.trim()) {
    throw new Error('消息内容不能为空')
  }

  // 生成消息ID
  const messageId = await redis.incr(REDIS_KEYS.LAST_MESSAGE_ID)
  const timestamp = Date.now()

  const message = {
    id: `msg_${messageId}`,
    username,
    content: content.trim(),
    timestamp,
  }

  // 存储到 Redis Sorted Set（使用 timestamp 作为 score）
  await redis.zadd(REDIS_KEYS.MESSAGES, { score: timestamp, member: JSON.stringify(message) })

  // 限制消息历史数量（保留最近1000条）
  // 暂时注释掉，先测试基本功能
  // await redis.zremrangebyrank(REDIS_KEYS.MESSAGES, 0, -1001)

  return message
}

/**
 * 获取聊天消息历史
 */
export async function getChatMessages(limit: number = 50, offset: number = 0) {
  try {
    // 获取最新的消息（按 timestamp 降序）
    // Upstash Redis 使用 zrange 并指定 REV 选项
    const messages = await redis.zrange(REDIS_KEYS.MESSAGES, offset, offset + limit - 1, { rev: true })

    // 如果 messages 是空数组或 undefined，返回空数组
    if (!messages || !Array.isArray(messages)) {
      return []
    }

    const parsedMessages = messages
      .map((msg) => {
        try {
          if (typeof msg === 'string') {
            return JSON.parse(msg)
          }
          else if (msg && typeof msg === 'object') {
            // 如果已经是对象，直接返回
            return msg
          }
          return null
        }
        catch (error) {
          console.warn('Failed to parse message:', msg, error)
          return null
        }
      })
      .filter(Boolean)

    return parsedMessages.reverse() // 反转回时间顺序
  }
  catch (error) {
    console.error('Failed to get chat messages:', error)
    return []
  }
}

/**
 * 获取在线用户数量
 */
export async function getOnlineUserCount() {
  try {
    const onlineUsers = await getOnlineUsers()
    return onlineUsers.length
  }
  catch (error) {
    console.error('Failed to get online user count:', error)
    return 0
  }
}
