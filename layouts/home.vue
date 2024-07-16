<script setup lang="ts">
const colorMode = useColorMode()

function toggleDark() {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}

const router = useRouter()
const route = useRoute()
</script>

<template>
  <div id="home" text-slate-4>
    <header flex items-center gap4 p4>
      <NuxtLink flex items-center gap-1 title="Home" to="/">
        <KIcon animate-fade-in animate-duration-2000 hover="shadow-green" />
      </NuxtLink>
      <div flex-auto />
      <NuxtLink icon-btn title="Blog" to="/blog">
        <i i-iconoir-book inline-block sm-hidden />
        <span lt-sm:hidden>Blog</span>
      </NuxtLink>
      <NuxtLink icon-btn title="Notes" to="/notes">
        <i i-iconoir-pen-tablet inline-block sm-hidden />
        <span lt-sm:hidden>Notes</span>
      </NuxtLink>
      <NuxtLink icon-btn title="Projects" to="/projects">
        <i i-iconoir-code-brackets inline-block sm-hidden />
        <span lt-sm:hidden>Projects</span>
      </NuxtLink>
      <NuxtLink select-none title="Toggle Dark Scheme" icon-btn @click="() => toggleDark()">
        <div i-iconoir-sun-light dark:i-iconoir-half-moon />
      </NuxtLink>
    </header>
    <section px7>
      <slot />
    </section>
    <footer h-20 p4>
      <section mx-auto max-w-65ch>
        <button v-if="route.path !== '/'" i-iconoir-arrow-left-circle size-6 icon-btn @click="() => router.back()" />
      </section>
    </footer>
  </div>
</template>
