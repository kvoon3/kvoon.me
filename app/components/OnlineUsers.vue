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
  <div class="bg-white dark:bg-neutral-900 rounded-xl p-6 h-full shadow-sm">
    <div class="flex justify-between items-center mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
      <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
        在线用户
      </h3>
      <div class="flex items-baseline gap-1">
        <span class="text-2xl font-bold text-blue-500">{{ onlineCount }}</span>
        <span class="text-sm text-neutral-500 dark:text-neutral-400">人在线</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <div
        v-for="user in users"
        :key="user"
        class="flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <div class="w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-semibold text-base shrink-0 rounded-full">
          {{ getUserInitial(user) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-neutral-900 dark:text-white truncate">
            {{ user }}
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span class="text-xs text-neutral-500 dark:text-neutral-400">在线</span>
          </div>
        </div>
      </div>

      <div v-if="users.length === 0" class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
        暂无在线用户
      </div>
    </div>
  </div>
</template>
