import { loginUser } from '~~/lib/auth'

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

    const result = await loginUser(username, password)

    return {
      success: true,
      data: result,
    }
  }
  catch (error: any) {
    throw createError({
      statusCode: 401,
      message: error.message || '登录失败',
    })
  }
})
