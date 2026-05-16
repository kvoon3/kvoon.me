<script setup lang="ts">
defineProps<{
  category: string
  items: {
    name: string
    desc: string
    link: string
    icon: string
  }[]
}>()
</script>

<template>
  <div mb6>
    <h2 text-sm mb8 color-neutral>
      {{ category }}
    </h2>
    <div grid="~ lg:cols-2 gap-4">
      <NuxtLink
        v-for="project in items"
        :key="project.name"
        :title="project.name"
        :href="project.link"
        target="_blank"
        rel="noopener noreferrer"
        p4
        border="~ 1 base"
      >
        <div flex gap-4>
          <Icon :name="project.icon" shrink-0 size-10 mya />
          <div>
            <h3 font-medium line-clamp-1>
              {{ project.name }}
            </h3>
            <p text-sm text-gray-500 dark:text-gray-400 line-clamp-2>
              {{ project.desc }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>
