<script setup lang="ts">
import { toggleDark } from '~/logic/state'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <div id="home" text-slate-4>
    <header flex items-center justify-between p4>
      <section>
        <NuxtLink flex items-center gap-1 title="Home" to="/">
          <KIcon animate-fade-in animate-duration-2000 hover="shadow-green" />
        </NuxtLink>
      </section>
      <section flex items-center decoration-none space-x-4>
        <NuxtLink icon-btn title="Blog" to="/blog">
          <!-- <i i-iconoir-book inline-block /> -->
          Blog
        </NuxtLink>
        <NuxtLink icon-btn title="Notes" to="/notes">
          <!-- <i i-iconoir-pen-tablet inline-block />  -->
          Notes
        </NuxtLink>
        <NuxtLink icon-btn title="Projects" to="/projects">
          <!-- <i i-iconoir-code-brackets inline-block /> -->
          Projects
        </NuxtLink>
        <button i-iconoir-sun-light dark:i-iconoir-half-moon icon-btn @click="() => toggleDark()" />
      </section>
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
