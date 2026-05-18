<script setup lang="ts">
import { blurhashToCssGradientString } from '@unpic/placeholder'
import avatarMeta from '../data/avatar.json'

const { data: intro, error } = useAsyncData(
  '/intro',
  () => queryCollection('content').path('/intro').first(),
)

const { data: projectsContent, error: projectsError } = useAsyncData(
  '/projects',
  () => queryCollection('content').path('/projects').first(),
)

const avatarPlaceholderStyle = {
  background: blurhashToCssGradientString(avatarMeta.blurhash),
}

useSeoMeta({
  title: intro.value?.title,
  description: intro.value?.description,
})
</script>

<template>
  <div id="index-page" prose prose-neutral dark:prose-invert grid="~ md:cols-2 gap-8" container mxa pt12>
    <div px4>
      <div relative isolate>
        <NuxtImg src="/avatar_cropped.jpg" :quality="70" alt="avatar" relative z-1 object-cover rounded-full border-base size-30 :style="avatarPlaceholderStyle" />
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
          <div v-if="intro" key="content">
            <ContentRenderer :value="intro" />
          </div>
        </Transition>
      </div>
    </div>

    <section px4 space-y-12>
      <div v-if="projectsError" flex items-center my8 py4 px2 bg-neutral:10 role="alert">
        <Icon name="ph:warning-circle" size="24" class="mr-2" />
        <span>Failed to load projects. Please try again later.</span>
      </div>

      <ContentRenderer v-if="projectsContent" :value="projectsContent" />
    </section>
    <LicenseLink px4 py8 />
  </div>
</template>

<style>
#index-page :where(ul):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
  list-style: none !important;
  padding-left: 0 !important;
}
</style>

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
