<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(() => props.id && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true) || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h2)))
</script>

<template>
  <h4 :id="id" class="group" relative>
    <span
      v-if="id && generate"
      cursor-auto
    >
      <a
        v-if="id && generate"
        transition="all 200 ease-in-out"
        translate-x="-130%"
        absolute left-0 top-0 font-bold op0 class="group-active:op30 group-hover:op30"
        :href="`#${id}`"
      >#</a>
      <slot />
    </span>
  </h4>
</template>
