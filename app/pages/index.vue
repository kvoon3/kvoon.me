<script setup lang="ts">
import { projects } from '~/data/projects'

const { data, error } = useAsyncData(
  '/intro',
  async () => {
    const res = await queryCollection('content').path('/intro').first().catch((error) => {
      console.error('error', error)
    })
    console.error('res', res)

    return res
  },
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
        <div z-1 border-base size-30 relative rounded-full of-hidden>
          <NuxtImg src="/avatar.JPG" :quality="70" alt="avatar" w-full h-full object-cover />
        </div>
        <div absolute top-0 left-20>
          <div size-30 border="~ dashed base" rounded-full absolute />
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
          <Icon name="ph:git-pull-request" />
          My Open Pull Requests
        </NuxtLink>
        <NuxtLink block leading-loose w-fit target="_black" href="https://releases-bmz.pages.dev" bg-op-0 class="icon-btn">
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
    <LicenseLink px4 />
  </div>
</template>

<style scoped>
#icon {
  --blur-green: #a0f0eccd;
  --blur-min-range: 2px;
  --blur-max-range: 20px;
  animation: blur-loop 5s infinite
}

@keyframes blur-loop {
  0% {
    filter: blur(var(--blur-min-range)) drop-shadow(0 0 var(--blur-max-range) var(--blur-green))
  }

  50% {
    filter: blur(var(--blur-max-range))
  }

  100% {
    filter: blur(var(--blur-min-range)) drop-shadow(0 0 var(--blur-max-range) var(--blur-green))
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

.error-message {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 0.5rem;
  color: #c00;
  margin: 1rem 0;
}

.error-message .icon {
  flex-shrink: 0;
}
</style>
