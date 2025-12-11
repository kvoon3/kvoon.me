import { registerUser } from '~~/lib/auth'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    if (!username || !password) {
      throw createError({
        statusCode: 400,
        message: '用户名和密码不能为空',
      })
    }

    // 用户名长度限制
    if (username.length < 3 || username.length > 20) {
      throw createError({
        statusCode: 400,
        message: '用户名长度必须在3-20个字符之间',
      })
    }

    // 密码长度限制
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        message: '密码长度至少6个字符',
      })
    }

    const result = await registerUser(username, password)

    return {
      success: true,
      data: result,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 400,
      message: error.message || '注册失败',
    })
  }
})
