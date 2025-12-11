import { getChatMessages, verifyToken } from '~~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份（可选，公开聊天室可以不验证）
    const headers = getHeaders(event)
    const username = headers['x-username'] as string
    const token = headers['x-token'] as string

    if (username && token) {
      const authResult = await verifyToken(username, token)
      if (!authResult.valid) {
        throw createError({
          statusCode: 401,
          message: '认证无效或已过期',
        })
      }
    }

    // 获取查询参数
    const query = getQuery(event)
    const limit = Number.parseInt(query.limit as string) || 50
    const offset = Number.parseInt(query.offset as string) || 0

    // 限制最大数量
    const safeLimit = Math.min(limit, 100)
    const safeOffset = Math.max(offset, 0)

    // 获取消息
    const messages = await getChatMessages(safeLimit, safeOffset)

    return {
      success: true,
      data: {
        messages,
        limit: safeLimit,
        offset: safeOffset,
        hasMore: messages.length === safeLimit,
      },
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || '获取消息失败',
    })
  }
})
