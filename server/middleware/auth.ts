import { verifyToken } from '~~/lib/auth'

export default defineEventHandler(async (event) => {
  // 只拦截 API 请求，不拦截页面路由
  if (!event.path.startsWith('/api/')) {
    return
  }

  // 不需要认证的 API 路径
  const publicPaths = ['/api/auth/register', '/api/auth/login']
  if (publicPaths.some(path => event.path.startsWith(path))) {
    return
  }

  // 对于聊天消息获取，可以允许公开访问
  if (event.path.startsWith('/api/chat/messages')) {
    return
  }

  // 检查认证头
  const headers = getHeaders(event)
  const username = headers['x-username'] as string
  const token = headers['x-token'] as string

  if (!username || !token) {
    throw createError({
      statusCode: 401,
      message: '需要认证',
    })
  }

  // 验证 token
  const authResult = await verifyToken(username, token)
  if (!authResult.valid) {
    throw createError({
      statusCode: 401,
      message: '认证无效或已过期',
    })
  }

  // 将用户信息添加到事件上下文
  event.context.user = { username }
})
