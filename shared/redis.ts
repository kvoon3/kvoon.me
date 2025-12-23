import { Redis } from '@upstash/redis'

function getRedisInstance() {
  const config = useRuntimeConfig()
  const redisUrl = config.upstashRedisRestUrl
  const redisToken = config.upstashRedisRestToken

  if (!redisUrl || !redisToken) {
    throw new Error('Missing Upstash Redis environment variables')
  }

  return new Redis({
    url: redisUrl,
    token: redisToken,
  })
}

export const redis = getRedisInstance()

export const REDIS_KEYS = {
  PASSWORD: (username: string) => `chat:password:${username}`,
  USER_INFO: (username: string) => `chat:users:${username}`,
  USER_TOKEN: (username: string, token: string) => `chat:token:user:${username}:${token}`,
  ONLINE_USER: (username: string) => `chat:online:${username}`,

  MESSAGES: (channelId: string) => `chat:messages:${channelId}`,
  LAST_MESSAGE_ID: (channelId: string) => `chat:last_message_id:${channelId}`,
  TYPING: (username: string) => `chat:typing:${username}`,
} as const

export const TOKEN_TTL_DAYS = Number(useRuntimeConfig().tokenTtlDays) || 90
export const TOKEN_GRACE_DAYS = Number(useRuntimeConfig().tokenGraceDays) || 365

export const TOKEN_TTL = TOKEN_TTL_DAYS * 24 * 60 * 60
export const GRACE_PERIOD = TOKEN_GRACE_DAYS * 24 * 60 * 60
export const ONLINE_TTL = 5 * 60
export const TYPING_TTL = 3
