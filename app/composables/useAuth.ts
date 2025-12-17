import { useCookie } from '#app'
import { computed } from 'vue'

export function useAuth() {
  const authCookie = useCookie<{ username: string, token: string, timestamp: number } | null>('chat-auth', {
    maxAge: 24 * 60 * 60, // 24 hrs
    sameSite: 'strict',
    secure: import.meta.env.PROD,
  })

  const username = computed(() => authCookie.value?.username ?? '')
  const token = computed(() => authCookie.value?.token ?? '')
  const timestamp = computed(() => authCookie.value?.timestamp ?? 0)

  const isAuthenticated = computed(() => !!username.value && !!token.value)

  tryCleanAuthCookie()

  async function tryCleanAuthCookie() {
    if (!authCookie.value)
      return

    const tokenAge = Date.now() - timestamp.value
    const maxAge = 24 * 60 * 60 * 1000 // 24 hrs

    if (tokenAge > maxAge)
      authCookie.value = null
  }

  function setAuth(user: string, authToken: string) {
    authCookie.value = {
      username: user,
      token: authToken,
      timestamp: Date.now(),
    }
  }

  function logout() {
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
