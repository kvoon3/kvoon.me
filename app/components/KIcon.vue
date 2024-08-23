<script setup lang="ts">
import Zdog from 'zdog'
import { rotateIlloZ } from '~/utils/animate'

const props = withDefaults(defineProps<{
  size?: number
  weight?: number
}>(), {
  size: 40,
  weight: 15,
})

const colorMode = useColorMode()

const iconColor = computed(() => colorMode.value === 'light' ? 'black' : 'white')

watchEffect(() => {
  consola.log('iconColor.value', iconColor.value)
})

const height = computed(() => props.size)
const width = computed(() => props.size / 2)

const zdogRef = shallowRef<HTMLCanvasElement | undefined>()
const illo = shallowRef<Zdog.Illustration | undefined>()

function renderZDogCanvas() {
  if (!zdogRef.value)
    return

  if (illo.value)
    illo.value.remove()

  illo.value = new Zdog.Illustration({
    element: zdogRef.value,
    zoom: 0.3,
    dragRotate: true,
  })

  const lines = [
    [
      { x: -width.value / 2, y: height.value / 2 },
      { x: -width.value / 2, y: -height.value / 2 },
    ],
    [
      { x: -1, y: 0 },
      { x: width.value / 2, y: -height.value / 2 },
    ],
    [
      { x: -2, y: 0 },
      { x: width.value / 2, y: height.value / 2 },
    ],
  ].map(path =>
    new Zdog.Shape({
      addTo: illo.value,
      path,
      stroke: props.weight,
      color: iconColor.value,
    }),
  )

  watch(iconColor, color => lines.forEach(line => line.color = color))

  rotateIlloZ(illo.value)

  illo.value.updateRenderGraph()
}

onMounted(() => {
  if (zdogRef.value)
    renderZDogCanvas()
})
</script>

<template>
  <canvas
    ref="zdogRef"
    class="zdog-canvans"
    :width="height"
    :height="height"
    float-left cursor-grab border rounded-full active:cursor-grabbing
  />
</template>
