<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})

const title = computed(() => route.path === '/' ? 'Kevin Kwong' : `${data.value?.title} - Kevin Kwong`)

useSeoMeta({
  title,
  description: data.value?.description,
})
</script>

<template>
  <div>
    <main mxa prose dark:prose-invert p8>
      <h1> {{ data?.title }} </h1>

      <ContentRenderer v-if="data" w-fit :value="data" />
      <LicenseLink mt30 />
    </main>
  </div>
</template>
