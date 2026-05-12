<script setup lang="ts">
import type { ActivityPayload } from '~~/types/activity'
import {
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
} from 'reka-ui'

const { data: activity } = await useFetch<ActivityPayload | null>('/api/activity/current', {
  default: () => null,
})

const activityLabel = computed(() => activity.value?.appName ?? 'Idle')
const activityTitle = computed(() => activity.value?.windowTitle ?? 'No active window')
const activityTime = computed(() => activity.value?.timestamp ? new Date(activity.value.timestamp) : Date.now())
const rawActivityTimeAgo = useTimeAgo(activityTime)
const activityTimeAgo = computed(() => {
  if (!activity.value?.timestamp)
    return 'no activity yet'

  return rawActivityTimeAgo.value
    .replace('minute', 'min')
    .replace('minutes', 'mins')
})

const idleMessages = [
  'kvoon is zoning out...',
  'kvoon is procrastinating...',
  'kvoon is touching grass...',
  'kvoon is hibernating...',
] as const

type IdleMessage = (typeof idleMessages)[number]

const idleMessage = ref<IdleMessage>('kvoon is touching grass...')

useIntervalFn(() => {
  if (!activity.value?.appName)
    idleMessage.value = idleMessages[Math.floor(Math.random() * idleMessages.length)]!
}, 5000)

const open = ref(false)

let stream: EventSource | null = null

onMounted(() => {
  stream = new EventSource('/api/activity/stream')

  stream.onmessage = (event) => {
    activity.value = JSON.parse(event.data) as ActivityPayload
  }
})

onBeforeUnmount(() => {
  stream?.close()
})
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button
        type="button"
        aria-label="Current app activity"
        size-6 grid place-items-center rounded-md outline-none transition-opacity hover:op-80 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-op-45
      >
        <Transition name="app-icon" mode="out-in">
          <NuxtImg
            v-if="activity?.appIconDataUrl"
            :key="activity.appIconDataUrl"
            :src="activity.appIconDataUrl"
            :alt="`${activityLabel} icon`"
            size-6 object-contain
          />
          <Icon v-else :key="activityLabel" name="ph:ghost" size="20" />
        </Transition>
      </button>
    </PopoverTrigger>

    <PopoverPortal>
      <PopoverContent
        class="PopoverContent"
        side="bottom"
        align="start"
        :side-offset="10"
        :collision-padding="16"
        z-50 w-82 rounded-md border-base bg="$c-bg" p4 text="$c-base" shadow-lg outline-none
      >
        <div flex="~ gap4">
          <div relative size-16 shrink-0>
            <NuxtImg src="avatar_cropped.jpg" alt="kvoon" size-16 object-cover rounded-full />

            <div fixed top-16 left-16 size-6 grid place-items-center rounded-full border border-neutral:20 bg="$c-bg" shadow-sm>
              <Transition name="app-icon" mode="out-in">
                <img
                  v-if="activity?.appIconDataUrl"
                  :key="activity.appIconDataUrl"
                  :src="activity.appIconDataUrl"
                  :alt="`${activityLabel} icon`"
                  size-6 object-contain
                >
                <Icon v-else :key="activityLabel" name="ph:ghost" size="16" />
              </Transition>
            </div>
          </div>

          <div min-w-0 flex-1>
            <Transition name="fade-slide" mode="out-in">
              <p v-if="activity?.appName" class="activity-label" :data-text="`kvoon is using ${activityLabel}`" text-base font-medium leading-snug>
                kvoon is using {{ activityLabel }}
              </p>
              <p v-else :key="idleMessage" text-base font-medium leading-snug>
                {{ idleMessage }}
              </p>
            </Transition>
            <p mt1 text-sm text-neutral>
              {{ activityTimeAgo }}
            </p>
          </div>
        </div>

        <div v-if="activity?.windowTitle" mt4 border-t border-neutral:20 pt3>
          <p text-xs text-neutral>
            Window
          </p>
          <p mt1 text-sm break-words leading-snug>
            {{ activityTitle }}
          </p>
        </div>

        <div v-else mt4 border-t border-neutral:20 pt3 text-sm text-neutral>
          No active window title
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style>
.PopoverContent {
  transform-origin: var(--reka-popover-content-transform-origin);
}

.PopoverContent[data-state="open"] {
  animation: popover-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.PopoverContent[data-state="closed"] {
  animation: popover-out 150ms ease-in;
}

@keyframes popover-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes popover-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}
</style>

<style scoped>
.app-icon-enter-active,
.app-icon-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.app-icon-enter-from {
  opacity: 0;
  transform: translateY(4px) scale(0.9);
}

.app-icon-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.9);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.activity-label {
  position: relative;
  display: inline-block;
  color: rgba(120, 120, 120, 0.75);
}

.activity-label::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  background-image: linear-gradient(
    90deg,
    transparent 0%,
    transparent 35%,
    rgba(255, 255, 255, 0.95) 50%,
    transparent 65%,
    transparent 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  background-clip: text;
  -webkit-background-clip: text;
  animation: thinking-highlight 2s linear infinite;
  pointer-events: none;
}

@media (prefers-color-scheme: dark) {
  .activity-label {
    color: rgba(160, 160, 160, 0.55);
  }

  .activity-label::after {
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      transparent 35%,
      rgba(255, 255, 255, 0.9) 50%,
      transparent 65%,
      transparent 100%
    );
  }
}

@keyframes thinking-highlight {
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
}
</style>
