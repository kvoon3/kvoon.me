<script setup lang="ts">
import { toggleDark } from '~/logic/state'

const router = useRouter()
</script>

<template>
  <div id="home" text-slate-4 dark:text-slate-1>
    <header dark="border-slate-8" sticky top-0 flex items-center justify-between border-b-1 bg-base>
      <section>
        <NuxtLink flex items-center gap-1 title="Home" to="/">
          <KIcon animate-fade-in animate-duration-2000 hover="shadow-green" />
        </NuxtLink>
      </section>
      <section flex items-center decoration-none space-x-2>
        <NuxtLink flex items-center gap-1 title="Posts" to="/posts">
          <i i-iconoir-book inline-block />
        </NuxtLink>
        <NuxtLink flex items-center gap-1 title="Notes" to="/notes">
          <i i-iconoir-pen-tablet inline-block />
        </NuxtLink>
        <NuxtLink flex items-center gap-1 title="Project" to="/project">
          <i i-iconoir-code-brackets inline-block />
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

<style scoped>
#home > * {
  @apply: p4
}
</style>
