import { redis, REDIS_KEYS } from '#shared/redis'

/**
 * Get online users list
 */
export async function getOnlineUsers() {
  try {
    // Use SCAN command to find all chat:online:* keys
    let cursor = '0'
    const onlineUsers: string[] = []

    do {
      const result = await redis.scan(cursor, {
        match: REDIS_KEYS.ONLINE_USER('*'),
        count: 100,
      })
      cursor = result[0]

      // Extract usernames from key names
      const keys = result[1]
      for (const key of keys) {
        // Key format: chat:online:{username}
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
 * Set user typing status
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
 * Get typing users
 */
export async function getTypingUsers() {
  try {
    // Use SCAN command to find all chat:typing:* keys
    let cursor = '0'
    const typingUsers: string[] = []

    do {
      const result = await redis.scan(cursor, {
        match: REDIS_KEYS.TYPING('*'),
        count: 100,
      })
      cursor = result[0]

      // Extract usernames from key names
      const keys = result[1]
      for (const key of keys) {
        // Key format: chat:typing:{username}
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
 * Get online user count
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
