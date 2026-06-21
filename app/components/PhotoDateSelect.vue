<script setup lang="ts">
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'
import { formatDate } from '~/utils/photo-date'

const props = defineProps<{
  label: string
  dates: Date[]
  selected: Date
}>()

const emit = defineEmits<{
  select: [date: Date]
}>()

const selectedKey = computed(() => formatDate(props.selected))
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <button
        type="button"
        rounded-md
        border
        px3
        py1
        text-sm
        inline-flex
        items-center
        gap-2
        transition
        outline-none
        class="border-neutral-300 color-neutral-700 bg-neutral/5 hover:border-primary hover:color-primary focus-visible:ring-1 focus-visible:ring-primary data-[state=open]:border-primary data-[state=open]:color-primary data-[state=open]:bg-primary/10 dark:border-neutral-700 dark:color-neutral-200"
      >
        <Icon name="ph:calendar-blank-duotone" :size="16" />
        <span>{{ label }}: {{ selectedKey }}</span>
        <Icon name="ph:caret-down-duotone" :size="14" />
      </button>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        side="bottom"
        align="start"
        :side-offset="8"
        :collision-padding="16"
        class="date-dropdown-content z-50 max-h-60 w-44 overflow-y-auto rounded-md border border-neutral-300 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
      >
        <button
          v-for="date in dates"
          :key="date.getTime()"
          type="button"
          class="w-full rounded px-2 py-1.5 text-left text-sm transition hover:bg-primary/10"
          :class="formatDate(date) === selectedKey ? 'color-primary bg-primary/10' : 'color-neutral-700 dark:color-neutral-200'"
          @click="emit('select', date)"
        >
          {{ formatDate(date) }}
        </button>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.date-dropdown-content {
  transform-origin: var(--reka-popover-content-transform-origin);
}

.date-dropdown-content[data-state='open'] {
  animation: date-dropdown-in 0.16s ease;
}

.date-dropdown-content[data-state='closed'] {
  animation: date-dropdown-out 0.12s ease;
}

@keyframes date-dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes date-dropdown-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
}
</style>
