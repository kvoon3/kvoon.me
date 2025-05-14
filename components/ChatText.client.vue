<script setup lang="ts">
import markdownIt from 'markdown-it'

const props = defineProps<{
  stream: ReadableStream
}>()

const md = markdownIt()

const text = shallowRef('')
const htmlText = shallowRef('')

const isPending = shallowRef(false)

watch(() => props.stream, (s) => {
  if (!s)
    return

  isPending.value = true

  const reader = s.getReader()

  const readText = async () => {
    const { value, done } = await reader.read()
    isPending.value = false
    text.value += value || ''
    if (!done)
      readText()
  }
  readText()
}, { immediate: true })

watch(text, (text) => {
  if (text)
    htmlText.value = md.render(text)
})
</script>

<template>
  <div rounded border p4>
    <div prose max-w-full v-html="htmlText" />
    <slot>
      <div v-if="!isPending">
        <div
          v-for="i in 3" :key="i" h4 bg-neutral:40 my2 animate-pulse rounded
        />
      </div>
    </slot>
  </div>
</template>
