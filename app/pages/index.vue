<script setup lang="ts">
import { projects } from '~/data/projects'

const { data, error } = useAsyncData(
  '/intro',
  () => queryCollection('content').path('/intro').first(),
)

useSeoMeta({
  title: data.value?.title,
  description: data.value?.description,
})
</script>

<template>
  <div grid="~ md:cols-2 gap-8" container mxa pt12>
    <div prose dark:prose-invert px4>
      <div relative isolate>
        <NuxtImg src="/avatar_cropped.JPG" :quality="70" alt="avatar" relative z-1 object-cover rounded-full border-base size-30 />
        <div absolute top-0 left-20 z-0 shadow-sm dark:shadow-neutral-500 rounded-full>
          <MyIcon id="icon" :size="120" :weight="50" />
        </div>
      </div>
      <div>
        <div v-if="error" flex items-center my8 py4 px2 bg-neutral:10 role="alert">
          <Icon name="ph:warning-circle" size="24" class="mr-2" />
          <span>Failed to load content. Please try again later.</span>
        </div>

        <Transition name="fade" mode="out-in">
          <div v-if="data" key="content">
            <ContentRenderer :value="data" />
          </div>
        </Transition>
      </div>
    </div>

    <section space-y-12>
      <CategoryCard name="Recent Active" text-xl>
        <NuxtLink block leading-loose w-fit target="_black" href="https://my-pull-requests.kvoon.me" bg-op-0 class="icon-btn">
          <Icon size-4 name="ph:git-pull-request" />
          My Open Pull Requests
        </NuxtLink>
        <NuxtLink block leading-loose w-fit target="_black" href="https://releases-bmz.pages.dev" bg-op-0 class="icon-btn">
          <Icon size-4 name="ph:git-commit-duotone" />
          My Releases
        </NuxtLink>
      </CategoryCard>
      <CategoryCard name="Projects">
        <div v-for="(categoryProjects, category) in projects" :key="category" mb6>
          <h2 text-sm mb8 color-neutral>
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
              border-base
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
    <LicenseLink px4 py8 />
  </div>
</template>

<style scoped>
#icon {
  --blur-min-range: 2px;
  --blur-max-range: 20px;
  animation: blur-loop 5s infinite;
}

@keyframes blur-loop {
  0% {
    filter: blur(var(--blur-min-range)) drop-shadow(0 0 var(--blur-max-range) var(--c-primary))
  }

  50% {
    filter: blur(var(--blur-max-range))
  }

  100% {
    filter: blur(var(--blur-min-range)) drop-shadow(0 0 var(--blur-max-range) var(--c-primary))
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
