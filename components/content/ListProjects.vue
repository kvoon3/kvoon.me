<script setup lang="ts">
type Category = string
interface Project {
  name: string
  desc: string
  link: string
}

const props = defineProps<{
  projects:
  Record<Category, Project[]>
}>()

consola.log('props', props)
</script>

<template>
  <div v-for="project, category, key in props.projects" :key>
    <div text-xl>
      {{ category }}
    </div>
    <ul>
      <li v-for="{ name, desc, link }, k in project" :key="k">
        <a :href="link" link no-underline>
          {{ name }} <span text-sm op70> - {{ desc }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>
