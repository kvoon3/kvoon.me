<script setup>
const { data: navigation } = await useAsyncData('navigation', () => fetchContentNavigation())

const posts = navigation.value
  ?.find(i => i.title === 'Post')?.children
  ?.filter(post => post._path !== '/posts')
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
