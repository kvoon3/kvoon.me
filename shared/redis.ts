import { Redis } from '@upstash/redis'

const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL
const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN

if (!redisUrl || !redisToken) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

export const REDIS_KEYS = {
  PASSWORD: (username: string) => `chat:password:${username}`,
  USER_INFO: (username: string) => `chat:users:${username}`,
  USER_TOKEN: (username: string, token: string) => `chat:token:user:${username}:${token}`,
  ONLINE_USER: (username: string) => `chat:online:${username}`,

  MESSAGES: (channelId: string) => `chat:messages:${channelId}`,
  LAST_MESSAGE_ID: (channelId: string) => `chat:last_message_id:${channelId}`,
  TYPING: (username: string) => `chat:typing:${username}`,
} as const

export const TOKEN_TTL = 90 * 24 * 60 * 60
export const GRACE_PERIOD = 365 * 24 * 60 * 60
export const ONLINE_TTL = 5 * 60
export const TYPING_TTL = 3 // secends
