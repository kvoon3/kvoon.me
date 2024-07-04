<script setup lang="ts">
const props = defineProps<{
  projects: Record<string, {
    name: string
    desc: string
    link: string
  }>[]
}>()

consola.log('props', props)
</script>

<template>
  <div v-for="project, category, key in props.projects" :key>
    <div text-xl>
      {{ category }}
    </div>
    <ul>
      <li v-for="{ name, desc, link }, key in project" :key>
        <a :href="link" link no-underline>
          {{ name }} <span text-sm op70> - {{ desc }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
