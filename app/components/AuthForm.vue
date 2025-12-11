<script setup lang="ts">
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

const auth = useAuth()

const activeTab = ref('login')
const isLoading = ref(false)
const loginError = ref('')
const registerError = ref('')

const loginForm = ref({
  username: '',
  password: '',
})

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

// Clear errors when switching tabs
watch(activeTab, () => {
  loginError.value = ''
  registerError.value = ''
})

async function handleLogin() {
  if (!loginForm.value.username || !loginForm.value.password) {
    loginError.value = 'Username and password required'
    return
  }

  isLoading.value = true
  loginError.value = ''

  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: loginForm.value.username,
        password: loginForm.value.password,
      },
    })

    if (response.success) {
      auth.setAuth(response.data.username, response.data.token)
      loginForm.value = { username: '', password: '' }
    }
  }
  catch (error: any) {
    loginError.value = error.data?.message || 'Login failed'
  }
  finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!registerForm.value.username || !registerForm.value.password) {
    registerError.value = 'Username and password required'
    return
  }

  if (registerForm.value.username.length < 3 || registerForm.value.username.length > 20) {
    registerError.value = 'Username must be 3-20 characters'
    return
  }

  if (registerForm.value.password.length < 6) {
    registerError.value = 'Password must be at least 6 characters'
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerError.value = 'Passwords do not match'
    return
  }

  isLoading.value = true
  registerError.value = ''

  try {
    const response = await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        username: registerForm.value.username,
        password: registerForm.value.password,
      },
    })

    if (response.success) {
      const loginResponse = await $fetch('/api/auth/login', {
        method: 'POST',
        body: {
          username: registerForm.value.username,
          password: registerForm.value.password,
        },
      })

      if (loginResponse.success) {
        auth.setAuth(loginResponse.data.username, loginResponse.data.token)
        registerForm.value = { username: '', password: '', confirmPassword: '' }
        activeTab.value = 'login'
      }
    }
  }
  catch (error: any) {
    registerError.value = error.data?.message || 'Registration failed'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="max-w-sm mx-auto p-6 bg-base rounded-lg border border-gray-200 dark:border-gray-800 transition-all duration-300">
    <TabsRoot v-model="activeTab" default-value="login" class="space-y-4">
      <TabsList class="flex border-b border-gray-200 dark:border-gray-800">
        <TabsTrigger
          value="login"
          class="flex-1 py-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 data-[state=active]:text-black data-[state=active]:dark:text-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:dark:border-white transition-all duration-200"
        >
          Sign In
        </TabsTrigger>
        <TabsTrigger
          value="register"
          class="flex-1 py-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 data-[state=active]:text-black data-[state=active]:dark:text-white data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:dark:border-white transition-all duration-200"
        >
          Create Account
        </TabsTrigger>
      </TabsList>

      <TabsContent value="login" class="outline-none">
        <form class="space-y-3" @submit.prevent="handleLogin">
          <div>
            <input
              v-model="loginForm.username"
              type="text"
              required
              class="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Your name"
            >
          </div>
          <div>
            <input
              v-model="loginForm.password"
              type="password"
              required
              class="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Password"
            >
          </div>
          <div v-if="loginError" class="text-black dark:text-white text-xs opacity-75 animate-fade-in">
            {{ loginError }}
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full border border-black dark:border-white text-black dark:text-white py-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </TabsContent>

      <TabsContent value="register" class="outline-none">
        <form class="space-y-3" @submit.prevent="handleRegister">
          <div>
            <input
              v-model="registerForm.username"
              type="text"
              required
              class="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Your name"
            >
          </div>
          <div>
            <input
              v-model="registerForm.password"
              type="password"
              required
              class="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Password"
            >
          </div>
          <div>
            <input
              v-model="registerForm.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 bg-transparent border-b border-gray-300 dark:border-gray-700 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              placeholder="Confirm password"
            >
          </div>
          <div v-if="registerError" class="text-black dark:text-white text-xs opacity-75 animate-fade-in">
            {{ registerError }}
          </div>
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full border border-black dark:border-white text-black dark:text-white py-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ isLoading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
      </TabsContent>
    </TabsRoot>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 0.75;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
