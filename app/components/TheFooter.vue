<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div :class="{ 'container mxa': route.path === '/' }" p4>
    <span class="text-sm op50"><a target="_blank" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a> 2023-PRESENT © Kevin Kwong</span>
  </div>
</template>
