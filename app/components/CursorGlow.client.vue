<script setup lang="ts">
const glow = ref<HTMLElement>()
const isVisible = ref(false)
const isEnabled = ref(false)
const isTouching = ref(false)

let frameId = 0
let hideTimer: number | undefined
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0

function render() {
  const speed = isTouching.value ? 0.42 : 0.18

  currentX += (targetX - currentX) * speed
  currentY += (targetY - currentY) * speed

  if (glow.value)
    glow.value.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`

  frameId = requestAnimationFrame(render)
}

function moveGlow(event: PointerEvent) {
  targetX = event.clientX
  targetY = event.clientY

  window.clearTimeout(hideTimer)

  if (!isVisible.value) {
    currentX = targetX
    currentY = targetY
    isVisible.value = true
  }
}

function handlePointerDown(event: PointerEvent) {
  if (event.pointerType === 'touch')
    isTouching.value = true

  moveGlow(event)
}

function handlePointerMove(event: PointerEvent) {
  if (event.pointerType === 'touch' && event.buttons === 0)
    return

  moveGlow(event)
}

function handlePointerUp() {
  isTouching.value = false
  hideTimer = window.setTimeout(hideGlow, 280)
}

function hideGlow() {
  isTouching.value = false
  isVisible.value = false
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  isEnabled.value = !reducedMotion.matches

  if (!isEnabled.value)
    return

  window.addEventListener('pointerdown', handlePointerDown)
  window.addEventListener('pointermove', handlePointerMove)
  window.addEventListener('pointerup', handlePointerUp)
  window.addEventListener('pointercancel', handlePointerUp)
  window.addEventListener('pointerleave', hideGlow)

  frameId = requestAnimationFrame(render)
})

onBeforeUnmount(() => {
  window.clearTimeout(hideTimer)
  window.removeEventListener('pointerdown', handlePointerDown)
  window.removeEventListener('pointermove', handlePointerMove)
  window.removeEventListener('pointerup', handlePointerUp)
  window.removeEventListener('pointercancel', handlePointerUp)
  window.removeEventListener('pointerleave', hideGlow)
  cancelAnimationFrame(frameId)
})
</script>

<template>
  <div
    v-if="isEnabled"
    ref="glow"
    class="cursor-glow"
    :class="{ 'cursor-glow-visible': isVisible }"
  >
    <div class="cursor-glow-light" />
  </div>
</template>

<style scoped>
.cursor-glow {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 30;
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease;
  will-change: transform;
}

.cursor-glow-light {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  background:
    radial-gradient(circle, rgb(232 255 253 / 0.18) 0%, rgb(216 255 252 / 0.08) 34%, transparent 68%);
  filter: blur(18px);
  mix-blend-mode: screen;
  animation: cursor-glow-breathe 3.8s ease-in-out infinite;
  will-change: transform, opacity;
}

html:not(.dark) .cursor-glow-light {
  background:
    radial-gradient(circle, rgb(2 158 145 / 0.1) 0%, rgb(2 158 145 / 0.03) 36%, transparent 70%);
  mix-blend-mode: multiply;
}

.cursor-glow-visible {
  opacity: 1;
}

@keyframes cursor-glow-breathe {
  0%,
  100% {
    opacity: 0.42;
    transform: scale(0.92);
  }

  50% {
    opacity: 0.68;
    transform: scale(1.08);
  }
}
</style>
