declare module 'nuxt/schema' {
  interface RuntimeConfig {
    upstashRedisRestUrl: string
    upstashRedisRestToken: string

    pusherAppId: string
    pusherKey: string
    pusherSecret: string
    pusherCluster: string

    tokenTtlDays: string
    tokenGraceDays: string

    deepseekApiKey: string
    deepseekBaseUrl: string
  }

  interface PublicRuntimeConfig {
    pusherKey: string
    pusherCluster: string
  }
}

export {}
