import { useCookie, useState } from '#app'
import { computed, onMounted } from 'vue'

export function useAuth() {
  const username = useState<string | null>('auth-username', () => null)
  const token = useState<string | null>('auth-token', () => null)

  // 使用 cookie 存储认证信息
  const authCookie = useCookie<{ username: string, token: string, timestamp: number } | null>('chat-auth', {
    maxAge: 24 * 60 * 60, // 24小时
    sameSite: 'strict',
    secure: import.meta.env.PROD,
  })

  const isAuthenticated = computed(() => !!username.value && !!token.value)

  // 验证 token 是否有效
  const verifyAuthToken = async (): Promise<boolean> => {
    if (!username.value || !token.value) {
      return false
    }

    try {
      const response = await $fetch('/api/auth/verify', {
        headers: {
          'X-Username': username.value,
          'X-Token': token.value,
        },
      })

      return response.success && response.data.valid
    }
    catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  // 从 cookie 加载认证信息并验证
  const loadAuthFromCookie = async () => {
    if (authCookie.value) {
      const { username: storedUsername, token: storedToken, timestamp } = authCookie.value

      // 检查 token 是否过期（24小时）
      const now = Date.now()
      const tokenAge = now - timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24小时

      if (tokenAge < maxAge) {
        username.value = storedUsername
        token.value = storedToken

        // 验证 token 是否在服务器端仍然有效
        const isValid = await verifyAuthToken()
        if (!isValid) {
          // Token 无效，清除认证信息
          username.value = null
          token.value = null
          authCookie.value = null
        }
      }
      else {
        // Token 过期，清除 cookie
        authCookie.value = null
      }
    }
  }

  // 在组件挂载时加载认证信息
  onMounted(async () => {
    await loadAuthFromCookie()
  })

  // 设置认证信息
  const setAuth = (user: string, authToken: string) => {
    username.value = user
    token.value = authToken
    authCookie.value = {
      username: user,
      token: authToken,
      timestamp: Date.now(),
    }
  }

  // 登出
  const logout = () => {
    username.value = null
    token.value = null
    authCookie.value = null
  }

  // 获取认证头（用于 API 请求）
  const getAuthHeaders = (): Record<string, string> => {
    if (username.value && token.value) {
      return {
        'X-Username': username.value,
        'X-Token': token.value,
      }
    }
    return {}
  }

  return {
    username,
    token,
    isAuthenticated,
    setAuth,
    logout,
    getAuthHeaders,
  }
}
