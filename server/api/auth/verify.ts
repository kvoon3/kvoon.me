import { verifyToken } from '~~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const headers = getHeaders(event)
    const username = headers['x-username'] as string
    const token = headers['x-token'] as string

    if (!username || !token) {
      throw createError({
        statusCode: 401,
        message: '缺少认证信息',
      })
    }

    const result = await verifyToken(username, token)

    return {
      success: true,
      data: result,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 401,
      message: error.message || '认证失败',
    })
  }
})
