<script setup lang="ts">

</script>

<template>
  <div grid="~ cols-3 gap-4" p4>
    <div v-for="i in 100" :key="i" aspect-square border bg-neutral:10 />
  </div>
</template>
