<script setup lang="ts">
import { projects } from '~/data/projects'

const { data } = await useAsyncData(
  () => queryCollection('content').path('/').first(),
)

useSeoMeta({
  title: data.value?.title,
  description: data.value?.description,
})
</script>

<template>
  <div grid="~ md:cols-2" container mxa>
    <div prose p4>
      <div relative>
        <div z-1 border size-30 relative rounded-full of-hidden>
          <img src="/avatar.jpg" alt="avatar" w-full h-full object-cover>
        </div>
        <MyIcon absolute top-0 left-20 :size="120" :weight="50" />
      </div>
      <ContentRenderer v-if="data" :value="data" />

      <div v-else>
        404 not found
      </div>
    </div>
    <div p4 grid="~ rows-[min-content_1fr]">
      <h1 text-2xl font-bold mb4>
        Projects
      </h1>
      <div overflow-y-auto>
        <div v-for="(categoryProjects, category) in projects" :key="category" mb6>
          <h2 text-xl font-semibold mb2>
            {{ category }}
          </h2>
          <div grid="~ sm:cols-2 gap-4">
            <a
              v-for="project in categoryProjects"
              :key="project.name"
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              class="group"
              p4
              border
              hover:bg-neutral-50
              dark:hover:bg-neutral-800
              transition-colors
            >
              <div flex items-center gap-2>
                <Icon :name="project.icon" shrink-0 size-10 />
                <div>
                  <h3 font-medium group-hover:text-primary>{{ project.name }}</h3>
                  <p text-sm text-gray-500 dark:text-gray-400>{{ project.desc }}</p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
