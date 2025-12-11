import { sendChatMessage, verifyToken } from '~~/lib/auth'
import { triggerChatMessage } from '~~/lib/pusher'

export default defineEventHandler(async (event) => {
  try {
    // 验证用户身份
    const headers = getHeaders(event)
    const username = headers['x-username'] as string
    const token = headers['x-token'] as string

    if (!username || !token) {
      throw createError({
        statusCode: 401,
        message: '缺少认证信息',
      })
    }

    const authResult = await verifyToken(username, token)
    if (!authResult.valid) {
      throw createError({
        statusCode: 401,
        message: '认证无效或已过期',
      })
    }

    // 读取消息内容
    let body
    try {
      body = await readBody(event)
    }
    catch (error: any) {
      throw createError({
        statusCode: 400,
        message: `Invalid JSON body: ${error.message}`,
      })
    }

    const { content } = body

    if (!content || !content.trim()) {
      throw createError({
        statusCode: 400,
        message: '消息内容不能为空',
      })
    }

    // 发送消息
    const message = await sendChatMessage(username, content)

    // 触发 Pusher 事件
    await triggerChatMessage(message)

    return {
      success: true,
      data: message,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || '发送消息失败',
    })
  }
})
