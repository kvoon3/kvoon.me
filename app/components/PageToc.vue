<script setup lang="ts">
const { toc } = useContent()
</script>

<template>
  <div v-if="toc?.links?.length" class="group" text-sm>
    <button class="group-hover:op100" i-carbon-menu cursor-auto op50 icon-btn />
    <div class="group-hover:op100" transition="opacity 200 ease-in-out" mt4 min-h-30 op0>
      <ul v-if="toc && toc.links" leading-loose>
        <li v-for="link in toc.links" :key="link.text">
          <!-- TODO: may use the large text animation -->
          <!-- <a :href="`#${link.id}`" op50 hover="op85 text-base leading-normal" transition-all> -->
          <a :href="`#${link.id}`" op50 transition="opacity ease-in-out" hover-op85>
            {{ link.text }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
