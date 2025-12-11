import Pusher from 'pusher'
import { verifyToken } from '~~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const socketId = body.socket_id as string
    const channelName = body.channel_name as string

    // Get headers for authentication
    const headers = getHeaders(event)
    const username = headers['x-username'] as string
    const token = headers['x-token'] as string

    if (!socketId || !channelName) {
      throw createError({
        statusCode: 400,
        message: '缺少必要的 Pusher 参数',
      })
    }

    if (!username || !token) {
      throw createError({
        statusCode: 401,
        message: '缺少认证信息',
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

    // 初始化 Pusher 服务器端 SDK
    const pusher = new Pusher({
      appId: import.meta.env.PUSHER_APP_ID!,
      key: import.meta.env.PUSHER_KEY!,
      secret: import.meta.env.PUSHER_SECRET!,
      cluster: import.meta.env.PUSHER_CLUSTER!,
      useTLS: true,
    })

    // 对于 presence 频道，需要提供用户数据
    const presenceData = {
      user_id: username,
      user_info: {
        name: username,
      },
    }

    // 生成认证响应
    const authResponse = pusher.authorizeChannel(socketId, channelName, presenceData)
    return authResponse
  }
  catch (error: any) {
    throw createError({
      statusCode: 401,
      message: error.message || 'Pusher 认证失败',
    })
  }
})
