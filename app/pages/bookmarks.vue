<script setup lang="ts">
const bookmarks = ref([
  {
    name: 'Nuxt',
    url: 'https://nuxt.com',
    repo: 'https://github.com/nuxt/nuxt',
    icon: 'logos:nuxt-icon',
    tutorial: 'https://learn.nuxt.com',
  },
  {
    name: 'Vue',
    url: 'https://vuejs.org',
    repo: 'https://github.com/vuejs/vue',
    icon: 'logos:vue',
    playground: 'https://play.vuejs.org',
  },
  {
    name: 'VueUse',
    url: 'https://vueuse.org',
    repo: 'https://github.com/vueuse/vueuse',
    icon: 'logos:vueuse',
  },
  {
    name: 'Vite',
    url: 'https://vitejs.dev',
    repo: 'https://github.com/vitejs/vite',
    icon: 'logos:vitejs',
  },
  {
    name: 'UnoCSS',
    url: 'https://unocss.dev',
    repo: 'https://github.com/unocss/unocss',
    playground: 'https://unocss.dev/play',
    tutorial: 'https://tutorial.unocss.dev',
    icon: 'logos:unocss',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    repo: 'https://github.com/microsoft/TypeScript',
    playground: 'https://www.typescriptlang.org/play',
    icon: 'logos:typescript-icon',
  },
],
)

function open(url: string) {
  window.location.href = url
}
</script>

<template>
  <div p4>
    <h1 text-3xl font-bold leading-loose mb4 text-center>
      Bookmarks
    </h1>
    <div grid="~ cols-1 md:cols-2 lg:cols-3 xl:cols-4 gap-4">
      <a
        v-for="bookmark, key in bookmarks"
        :key="key"
        border="~ neutral-1 dark:neutral-9"
        :title="bookmark.name"
        hover:bg-active
        transition-colors
        transition-duration-300
        inline-flex="~ items-center"
        rounded py4 px6
        text-xl
        :href="bookmark.url"
      >
        <div :key="key" mya truncate flex="~ items-center gap4">
          <Icon v-if="bookmark.icon" size-6 :name="bookmark.icon" /> <span>{{ bookmark.name }}</span>
        </div>
        <div flex-auto />
        <div space-x-1>
          <button
            class="icon-btn group"
            :title="`Github: ${bookmark.name}`"
            @click.prevent.stop="open(bookmark.repo)"
          >
            <Icon name="ph:github-logo-duotone" />
          </button>
          <button
            class="icon-btn"
            :title="`DeepWiki: ${bookmark.name}`"
            @click.prevent.stop="open(bookmark.repo.replace('github.com', 'deepwiki.com'))"
          >
            <Icon name="simple-icons:wikipedia" />
          </button>
          <button
            v-if="bookmark.playground"
            class="icon-btn"
            :title="`Playground: ${bookmark.name}`"
            @click.prevent.stop="open(bookmark.playground)"
          >
            <Icon name="ph:play-circle-duotone" />
          </button>
          <button
            v-if="bookmark.tutorial"
            class="icon-btn"
            :title="`Tutorial: ${bookmark.name}`"
            @click.prevent.stop="open(bookmark.tutorial)"
          >
            <Icon name="ph:book-duotone" />
          </button>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.icon-btn {
  --uno: op50 hover-op100 rounded-full hover-bg-neutral/10 transition-colors p2 inline-flex items-center justify-center
    gap1;
}
</style>
