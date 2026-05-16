<script setup lang="ts">
import type { Component } from 'vue'
import type { UseMatrixTransitionOptions } from '~/composables/useMatrixTransition'
import { Primitive, Slot } from 'reka-ui'
import { ref } from 'vue'

type Options = UseMatrixTransitionOptions & {
  as?: string | Component
  asChild?: boolean
  text?: string
}

defineOptions({
  name: 'MatrixText',
})

const props = withDefaults(defineProps<Options>(), {
  as: 'span',
  asChild: false,
  immediate: true,
})

const targetEl = ref<HTMLElement | null>(null)
const { play } = useMatrixTransition(targetEl, {
  immediate: props.immediate,
})

function onRef(v: any) {
  targetEl.value = v?.$el ?? v ?? null
}

function onMouseEnter() {
  if (!props.immediate)
    play()
}

function onClick() {
  if (!props.immediate)
    play()
}
</script>

<template>
  <Primitive
    v-if="!asChild"
    :ref="onRef"
    :as="as"
    :class="{ 'cursor-pointer': !immediate }"
    @mouseenter="onMouseEnter"
    @click="onClick"
  >
    <template v-if="text">
      {{ text }}
    </template>
    <slot v-else />
  </Primitive>
  <Slot
    v-else
    :ref="onRef"
    :class="{ 'cursor-pointer': !immediate }"
    @mouseenter="onMouseEnter"
    @click="onClick"
  />
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
