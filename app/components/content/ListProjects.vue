<script setup lang="ts">
type Category = string
interface Project {
  name: string
  desc: string
  link: string
  icon?: string
}

const props = defineProps<{
  projects: Record<Category, Project[]>
}>()
</script>

<template>
  <div v-for="project, category, key in props.projects" :key>
    <h3>{{ category }}</h3>
    <section grid gap2 lg-sm:grid-cols-2>
      <a
        v-for="{ name, desc, link }, k in project" :key="k"
        :link target="_blank"
        flex border-none btn hover:border-none
      >
        <figure>
          <!-- TODO: fit all icons -->
          <!-- <Vim v-if="icon === 'vim'" v="base" mr4 inline size-6 />
          <i v-else mr2 v="base" :class="[icon || 'i-carbon-unknown']" /> -->
        </figure>
        <aside>
          <header>
            <span>{{ name }}</span>
          </header>
          <span text-xs op70>{{ desc }}</span>
        </aside>
      </a>
    </section>
  </div>
</template>
