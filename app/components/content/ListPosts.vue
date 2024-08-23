<script setup>
const { data } = await useAsyncData('blog', () => queryContent('/').find())

const posts = computed(() =>
  data.value.filter(d =>
    d._path.startsWith('/blog') && d._path !== '/blog',
  ),
)
</script>

<template>
  <ul>
    <li v-for="post, key in posts" :key="key">
      <NuxtLink :to="post._path">
        {{ post.alias || post.title }}
      </NuxtLink>
    </li>
  </ul>
</template>
