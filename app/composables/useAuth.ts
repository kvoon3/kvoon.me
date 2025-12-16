import { useCookie, useState } from '#app'
import { computed, onMounted } from 'vue'

export function useAuth() {
  const username = useState<string | null>('auth-username', () => null)
  const token = useState<string | null>('auth-token', () => null)

  const authCookie = useCookie<{ username: string, token: string, timestamp: number } | null>('chat-auth', {
    maxAge: 24 * 60 * 60, // 24 hrs
    sameSite: 'strict',
    secure: import.meta.env.PROD,
  })

  const isAuthenticated = computed(() => !!username.value && !!token.value)

  onMounted(async () => {
    await loadAuthFromCookie()
  })

  async function verifyAuthToken(): Promise<boolean> {
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

  async function loadAuthFromCookie() {
    if (authCookie.value) {
      const { username: storedUsername, token: storedToken, timestamp } = authCookie.value

      // 检查 token 是否过期（24小时）
      const now = Date.now()
      const tokenAge = now - timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24小时

      if (tokenAge < maxAge) {
        username.value = storedUsername
        token.value = storedToken

        const isValid = await verifyAuthToken()
        if (!isValid) {
          username.value = null
          token.value = null
          authCookie.value = null
        }
      }
      else {
        authCookie.value = null
      }
    }
  }

  function setAuth(user: string, authToken: string) {
    username.value = user
    token.value = authToken
    authCookie.value = {
      username: user,
      token: authToken,
      timestamp: Date.now(),
    }
  }

  function logout() {
    username.value = null
    token.value = null
    authCookie.value = null
  }

  function getAuthHeaders(): Record<string, string> {
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
