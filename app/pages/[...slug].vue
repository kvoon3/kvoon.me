<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
</script>

<template>
  <div>
    <main mxa prose pt12>
      <ContentRenderer v-if="data" w-fit :value="data" />
      <LicenseLink mt30 />
    </main>
  </div>
</template>
