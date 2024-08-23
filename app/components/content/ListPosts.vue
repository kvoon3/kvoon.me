<script setup>
const { data } = await useAsyncData('blog', () => fetchContentNavigation())

consola.log('data', data.value)

const posts = computed(() =>
  data.value
    ?.find(i => i._path === '/blog')?.children
    ?.filter(i => i._path !== '/blog'), // remove root
)
</script>

<template>
  <ul>
    <li v-for="post, key in posts" :key="key">
      <NuxtLink :to="post._path">
        {{ post.title }}
      </NuxtLink>
    </li>
  </ul>
</template>
