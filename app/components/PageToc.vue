<script setup lang="ts">
const { toc } = useContent()
</script>

<template>
  <div v-if="toc?.links?.length" class="group">
    <button class="group-hover:op100" i-carbon-list cursor-auto op50 icon-btn />
    <div min-h-30 op0 class="group-hover:op100" transition="all 200 ease-in-out">
      <ul v-if="toc && toc.links">
        <li v-for="link in toc.links" :key="link.text">
          <a :href="`#${link.id}`" op50 hover:op80>
            {{ link.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
