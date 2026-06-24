<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>

<template>
  <Transition name="scroll-hint">
    <div
      v-if="show"
      absolute inset-0 z-50 flex items-center justify-center pointer-events-none
    >
      <div class="scroll-hint">
        <Icon name="ph:command" :size="16" />
        <span>+ scroll to zoom</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.scroll-hint-enter-active,
.scroll-hint-leave-active {
  transition: opacity 0.2s ease;
}

.scroll-hint-enter-from,
.scroll-hint-leave-to {
  opacity: 0;
}

.scroll-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 9999px;
  background: rgba(23, 23, 23, 0.8);
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: white;
  backdrop-filter: blur(4px);
}

.dark .scroll-hint {
  background: rgba(255, 255, 255, 0.9);
  color: rgb(23, 23, 23);
}
</style>
