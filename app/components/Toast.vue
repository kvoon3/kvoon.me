<script setup lang="ts">
import { ToastClose, ToastDescription, ToastRoot } from 'reka-ui'

defineProps<{
  title?: string
  description: string
  variant?: 'default' | 'destructive'
}>()
const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <ToastRoot
    :open="open"
    class="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800 p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
    :class="{
      'bg-white dark:bg-neutral-900': variant === 'default',
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800': variant === 'destructive',
    }"
    @update:open="open = $event"
  >
    <div class="grid gap-1">
      <ToastDescription
        class="text-sm"
        :class="{
          'text-neutral-900 dark:text-neutral-50': variant === 'default',
          'text-red-900 dark:text-red-50': variant === 'destructive',
        }"
      >
        {{ description }}
      </ToastDescription>
    </div>
    <ToastClose
      class="absolute right-2 top-2 rounded-md p-1 text-neutral-950/50 dark:text-neutral-50/50 opacity-0 transition-opacity hover:text-neutral-950 dark:hover:text-neutral-50 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
      :class="{
        'hover:bg-neutral-100 dark:hover:bg-neutral-800': variant === 'default',
        'hover:bg-red-100 dark:hover:bg-red-800': variant === 'destructive',
      }"
    >
      <span class="sr-only">Close</span>
      ×
    </ToastClose>
  </ToastRoot>
</template>
