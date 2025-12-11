import { Redis } from '@upstash/redis'

// 从环境变量获取 Redis 配置
const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL
const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN

if (!redisUrl || !redisToken) {
  throw new Error('Missing Upstash Redis environment variables')
}

// 创建 Redis 客户端实例
export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
})

// Redis 键前缀和常量
export const REDIS_KEYS = {
  // 认证相关
  PASSWORD: (username: string) => `chat:password:${username}`,
  USER_INFO: (username: string) => `chat:users:${username}`,
  USER_TOKEN: (username: string, token: string) => `chat:token:user:${username}:${token}`,
  ONLINE_USER: (username: string) => `chat:online:${username}`,

  // 聊天相关
  MESSAGES: 'chat:messages',
  LAST_MESSAGE_ID: 'chat:last_message_id',
  TYPING: (username: string) => `chat:typing:${username}`,
} as const

// Token TTL 配置（秒）
export const TOKEN_TTL = 90 * 24 * 60 * 60 // 90天
export const GRACE_PERIOD = 365 * 24 * 60 * 60 // 365天宽限期
export const ONLINE_TTL = 5 * 60 // 5分钟
export const TYPING_TTL = 3 // 3秒
