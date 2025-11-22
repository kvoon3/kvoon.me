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
  <div grid="~ md:cols-2 gap-8" container mxa pt12>
    <div prose px4>
      <div relative>
        <div z-1 border size-30 relative rounded-full of-hidden>
          <NuxtImg src="/avatar.jpg" alt="avatar" w-full h-full object-cover />
        </div>
        <div absolute top-0 left-20>
          <div backdrop-blur-4 size-30 border="~ dashed neutral-3 dark:neutral-7" rounded-full absolute />
          <MyIcon :size="120" :weight="50" />
        </div>
      </div>
      <ContentRenderer v-if="data" :value="data" />

      <div v-else>
        404 not found
      </div>
    </div>

    <section space-y-12>
      <CategoryCard name="Recent Active" text-xl>
        <NuxtLink leading-loose w-fit target="_black" href="https://my-pull-requests.kvoon.me" bg-op-0 class="icon-btn">
          <Icon name="ph:git-pull-request" />
          My Open Pull Requests
        </NuxtLink>
        <NuxtLink leading-loose w-fit target="_black" href="https://releases-bmz.pages.dev" bg-op-0 class="icon-btn">
          <Icon name="ph:git-commit-duotone" />
          My Releases
        </NuxtLink>
      </CategoryCard>
      <CategoryCard name="Projects">
        <div v-for="(categoryProjects, category) in projects" :key="category" mb6>
          <h2 text-xl mb2 color-neutral>
            {{ category }}
          </h2>
          <div grid="~ lg:cols-2 gap-4">
            <NuxtLink
              v-for="project in categoryProjects"
              :key="project.name"
              :title="project.name"
              :href="project.link"
              target="_blank"
              rel="noopener noreferrer"
              p4
              border
              op-75
              hover:op-100
              transition-all
              duration-300
            >
              <div flex gap-4>
                <Icon :name="project.icon" shrink-0 size-10 mya />
                <div>
                  <h3 font-medium group-hover:text-primary line-clamp-1>
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
      </CategoryCard>
    </section>
  </div>
</template>
