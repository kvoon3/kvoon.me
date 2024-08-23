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
</script>

<template>
  <div v-for="project, category, key in props.projects" :key>
    <h3>{{ category }}</h3>
    <section space-y-4>
      <a
        v-for="{ name, desc, link }, k in project" :key="k" border-none
        btn hover:border-none
        :link
        target="_blank"
      >
        <header>{{ name }}</header>
        <span text-sm op70>{{ desc }}</span>
      </a>
    </section>
  </div>
</template>
