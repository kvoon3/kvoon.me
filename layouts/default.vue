<script setup lang="ts">

</script>

<template>
  <div h-full grid="~ rows-[min-content_1fr]" class="bg-wave">
    <TheNav />
    <div of-auto>
      <slot />
      <TheFooter />
    </div>
  </div>
</template>
