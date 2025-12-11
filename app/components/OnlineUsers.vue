<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  users: string[]
  currentUser?: string
}>()

const onlineCount = computed(() => {
  return props.users.length
})

function getUserInitial(username: string) {
  return username.charAt(0).toUpperCase()
}
</script>

<template>
  <div class="bg-white dark:bg-neutral-900 rounded-xl p-6 h-full">
    <div class="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      <h3 class="text-lg font-semibold text-black dark:text-white">
        Online Users
      </h3>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-bold text-black dark:text-white">{{ onlineCount }}</span>
        <span class="text-sm text-neutral-500 dark:text-neutral-400">online</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="user in users"
        :key="user"
        class="flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
      >
        <div class="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold text-base shrink-0 rounded-full">
          {{ getUserInitial(user) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-black dark:text-white truncate">
            {{ user }}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-neutral-500" />
            <span class="text-xs text-neutral-500 dark:text-neutral-400">online</span>
          </div>
        </div>
      </div>

      <div v-if="users.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
        No users online
      </div>
    </div>
  </div>
</template>
