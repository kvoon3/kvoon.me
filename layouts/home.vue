<script setup lang="ts">
import { toggleDark } from '~/logic/state'

const router = useRouter()
</script>

<template>
  <div id="home" text-slate-4 dark:text-slate-1>
    <header dark="border-slate-8" flex items-center justify-between border-b-1 bg-base>
      <section>
        <NuxtLink flex items-center gap-1 title="Home" to="/">
          <KIcon animate-fade-in animate-duration-2000 hover="shadow-green" />
        </NuxtLink>
      </section>
      <section flex items-center decoration-none space-x-2>
        <NuxtLink flex items-center gap-1 title="Blog" to="/blog">
          <!-- <i i-iconoir-book inline-block /> -->
          Blog
        </NuxtLink>
        <NuxtLink flex items-center gap-1 title="Notes" to="/notes">
          <!-- <i i-iconoir-pen-tablet inline-block />  -->
          Notes
        </NuxtLink>
        <NuxtLink flex items-center gap-1 title="Projects" to="/projects">
          <!-- <i i-iconoir-code-brackets inline-block /> -->
          Projects
        </NuxtLink>
        <button i-iconoir-sun-light dark:i-iconoir-half-moon @click="() => toggleDark()" />
      </section>
    </header>
    <section>
      <slot />
    </section>
    <footer dark="border-slate-8" h-20 border-t-1>
      <section flex items-center space-x-2>
        <button i-iconoir-arrow-left-circle @click="() => router.back()" />
      </section>
    </footer>
  </div>
</template>

<style lang="postcss" scoped>
#home > * {
  @apply: p4
}
</style>
