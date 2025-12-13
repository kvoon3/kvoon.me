<script setup lang="ts">
const route = useRoute()

const { data } = await useAsyncData(route.path, () => {
  return queryCollection('content').path(route.path).first()
})
</script>

<template>
  <div>
    <div mxa prose>
      <ContentRenderer v-if="data" w-fit :value="data" />
      <LicenseLink mt30 />
    </div>
  </div>
</template>
