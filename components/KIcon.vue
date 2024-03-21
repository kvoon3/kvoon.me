<script setup lang="ts">
import Zdog from 'zdog'
import { isDark } from '~/logic/state'
import { rotateIlloZ } from '~/utils/animate'

const zdogRef = shallowRef<HTMLCanvasElement | undefined>()

function renderZDogCanvas() {
  if (!zdogRef.value)
    return

  const illo = new Zdog.Illustration({
    element: zdogRef.value,
    zoom: 0.3,
    dragRotate: true,
  })

  const height = 40

  const lines = [
    [
      { x: -10, y: height / 2 },
      { x: -10, y: -height / 2 },
    ],
    [
      { x: -1, y: 0 },
      { x: 10, y: -height / 2 },
    ],
    [
      { x: 2, y: 0 },
      { x: 10, y: height / 2 },
    ],
  ].map(path =>
    new Zdog.Shape({
      addTo: illo,
      path,
      stroke: 15,
      color: isDark.value ? 'white' : 'black',
    }),
  )

  watch(isDark, v => lines.forEach(line => line.color = v ? 'white' : 'black'))

  rotateIlloZ(illo)

  illo.updateRenderGraph()
}

onMounted(() => {
  if (zdogRef.value)
    renderZDogCanvas()
})
</script>

<template>
  <canvas ref="zdogRef" class="zdog-canvans" width="50" height="50" float-left cursor-grab border rounded-full active:cursor-grabbing />
</template>
