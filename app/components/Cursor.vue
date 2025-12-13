<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const cursorElement = ref<HTMLElement>()
const position = ref({ x: 0, y: 0 })

let trails: HTMLElement[] = []
const trailTimeout: NodeJS.Timeout | null = null

function updatePosition(e: MouseEvent) {
  position.value = { x: e.clientX, y: e.clientY }

  // Create trail effect
  if (cursorElement.value) {
    const trail = cursorElement.value.cloneNode(true) as HTMLElement
    trail.style.position = 'fixed'
    trail.style.left = `${e.clientX}px`
    trail.style.top = `${e.clientY}px`
    trail.style.transform = 'translate(-50%, -50%) scale(1)'
    trail.style.opacity = '0.7'
    trail.style.transition = 'opacity 0.5s, transform 0.5s'

    document.body.appendChild(trail)
    trails.push(trail)

    // Remove old trails
    if (trails.length > 5) {
      const oldTrail = trails.shift()
      if (oldTrail && oldTrail.parentNode) {
        oldTrail.style.opacity = '0'
        oldTrail.style.transform = 'translate(-50%, -50%) scale(0.3)'
        setTimeout(() => {
          if (oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail)
          }
        }, 500)
      }
    }

    // Fade out current trail
    setTimeout(() => {
      if (trail.parentNode) {
        trail.style.opacity = '0'
        trail.style.transform = 'translate(-50%, -50%) scale(0.3)'
        setTimeout(() => {
          if (trail.parentNode) {
            trail.parentNode.removeChild(trail)
          }
          trails = trails.filter(t => t !== trail)
        }, 500)
      }
    }, 100)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', updatePosition)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updatePosition)

  // Clean up trails
  trails.forEach((trail) => {
    if (trail.parentNode) {
      trail.parentNode.removeChild(trail)
    }
  })
  trails = []

  if (trailTimeout) {
    clearTimeout(trailTimeout)
  }
})
</script>

<template>
  <div
    ref="cursorElement"
    class="fixed pointer-events-none z-50 w-5 h-5 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 backdrop-blur-sm transition-transform duration-100 ease-out border border-white/20 shadow-lg"
    :style="{
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translate(-50%, -50%)',
    }"
  />
</template>
