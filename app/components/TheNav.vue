<script setup lang="ts">
  import { Separator } from 'reka-ui'
  import { createReusableTemplate } from '@vueuse/core'
  import { ref, onMounted, onUnmounted } from 'vue'

  const [DefineSeparator, ReuseSeparator] = createReusableTemplate()

  const navContainer = ref<HTMLElement>()
  const showLeftFade = ref(false)
  const showRightFade = ref(true)

  const updateFadeVisibility = () => {
    if (!navContainer.value) return

    const { scrollLeft, scrollWidth, clientWidth } = navContainer.value

    // Show left fade if scrolled to the right
    showLeftFade.value = scrollLeft > 0

    // Show right fade if there's more content to scroll
    showRightFade.value = scrollLeft < scrollWidth - clientWidth - 1
  }

  onMounted(() => {
    if (navContainer.value) {
      navContainer.value.addEventListener('scroll', updateFadeVisibility)
      window.addEventListener('resize', updateFadeVisibility)
      // Initial check
      updateFadeVisibility()
    }
  })

  onUnmounted(() => {
    if (navContainer.value) {
      navContainer.value.removeEventListener('scroll', updateFadeVisibility)
    }
    window.removeEventListener('resize', updateFadeVisibility)
  })
</script>

<template>
  <DefineSeparator>
    <Separator w0.5 h4 bg-neutral:20 />
  </DefineSeparator>

  <nav p4 bg-neutral:10 flex="~ items-center gap4">
    <NuxtLink to="/" class="sm:block hidden">
      kvoon.me
    </NuxtLink>

    <div flex-auto />

    <div class="nav-scroll-wrapper" relative>
      <div
        ref="navContainer"
        class="nav-items-container"
        flex="~ items-center gap4"
        overflow-x-auto
        scrollbar-hide
        max-w="60 sm:80 md:100"
      >
      <NuxtLink to="/">
        Home
      </NuxtLink>

      <ReuseSeparator />

      <!-- <NuxtLink to="/projects">
        Projects
      </NuxtLink>

      <ReuseSeparator />

      <NuxtLink to="/about">
        About
      </NuxtLink>

      <ReuseSeparator /> -->

      <NuxtLink to="/photos">
        Photos
      </NuxtLink>

      <ReuseSeparator />

      <NuxtLink to="/experiments">
        Experiments
      </NuxtLink>
      </div>

      <!-- Gradient fade indicators -->
      <div
        class="fade-left"
        absolute top-0 bottom-0 left-0 w-8 pointer-events-none
        :class="{ 'opacity-0': !showLeftFade, 'opacity-100': showLeftFade }"
        transition-opacity duration-200
        bg-gradient-to-r from-neutral:10 to-transparent
      ></div>
      <div
        class="fade-right"
        absolute top-0 bottom-0 right-0 w-8 pointer-events-none
        :class="{ 'opacity-0': !showRightFade, 'opacity-100': showRightFade }"
        transition-opacity duration-200
        bg-gradient-to-l from-neutral:10 to-transparent
      ></div>
    </div>

    <ToggleDark />
  </nav>
</template>

<style scoped>
nav > span {
  --uno: text-neutral-800 dark: text-neutral-600;
}

.nav-items-container {
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
}

/* Custom scrollbar styling for better appearance */
.nav-items-container::-webkit-scrollbar {
  height: 4px;
}

.nav-items-container::-webkit-scrollbar-track {
  background: transparent;
}

.nav-items-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.nav-items-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.4);
}

/* Dark mode scrollbar */
@media (prefers-color-scheme: dark) {
  .nav-items-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  .nav-items-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}
</style>
